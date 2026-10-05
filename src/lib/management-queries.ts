// SQL values from requests are always bound parameters. The generated fragments below
// contain only fixed workflow keys; parity tests compare them with client-workflow.ts.
const effective = (key: string, evidence: string) =>
  `(CASE s.workflow->>'override_${key}' WHEN '1' THEN true WHEN '0' THEN false ELSE (${evidence}) END)`;
const present = (key: string) => `COALESCE(s.workflow->>'${key}', '') <> ''`;
const stages = [
  [
    'contract_sent',
    `${present('contract_prepared')} OR ${present('contract_sent')} OR COALESCE(s.contract_signed, false)`,
  ],
  ['signed', 'COALESCE(s.contract_signed, false)'],
  ['deposit', 'COALESCE(p.deposit, false)'],
  ['deposit_receipt', 'COALESCE(p.deposit_receipt, false)'],
  ['calendar_added', present('calendar_added')],
  ['shoot_done', present('shoot_done')],
  ['balance', 's.to_pay = 0'],
  ['balance_receipt', 'COALESCE(p.balance_receipt, false)'],
  ['editing_done', present('editing_done')],
  ['delivered', present('delivered')],
  ['review_requested', present('review_requested')],
];

// Validate before constructing a date, including malformed historical workflow data.
// ISO year 0000 is supported by JS; PostgreSQL represents that year as 1 BC.
const datedSessions = `WITH date_parts AS (
  SELECT s.id, s.client_id, s.session_type, s.package_type, s.to_pay, s.contract_signed, s.workflow,
    left(COALESCE(workflow->>'scheduled', ''), 10) AS raw_day FROM sessions s
), valid_months AS (
  SELECT *, CASE WHEN raw_day ~ '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'
    THEN make_date(CASE WHEN left(raw_day, 4)::int = 0 THEN -1 ELSE left(raw_day, 4)::int END,
      substring(raw_day, 6, 2)::int, 1) END AS month_start FROM date_parts
), dated AS (
  SELECT *, CASE WHEN month_start IS NOT NULL AND right(raw_day, 2)::int <=
    extract(day FROM month_start + interval '1 month - 1 day')
    THEN raw_day ELSE '' END AS day FROM valid_months
)`;

export const dashboardQuery = `${datedSessions}, payment_flags AS (
  SELECT session_id, bool_or(stage = 'deposit') AS deposit,
    bool_or(stage = 'deposit' AND receipt_status = 'issued') AS deposit_receipt,
    bool_or(stage = 'balance' AND receipt_status = 'issued') AS balance_receipt
  FROM session_payments GROUP BY session_id
), classified AS (
  SELECT s.*, c.name AS client_name,
    CASE WHEN day <> '' THEN to_char(month_start + (right(day, 2)::int - 1) + 14, 'YYYY-MM-DD') END AS deadline,
    ${effective('shoot_done', present('shoot_done'))} AS shot,
    ${effective('delivered', present('delivered'))} AS delivered,
    CASE ${stages.map(([key, evidence]) => `WHEN NOT ${effective(key, evidence)} THEN '${key}'`).join('\n')}
      END AS next_key
  FROM dated s JOIN clients c ON c.id = s.client_id
  LEFT JOIN payment_flags p ON p.session_id = s.id
  WHERE s.workflow->>'status' IS DISTINCT FROM 'cancelled'
), active AS (
  SELECT *, COALESCE(deadline < $1 AND NOT delivered, false) AS overdue FROM classified
), attention AS (
  SELECT * FROM active WHERE next_key IS NOT NULL OR overdue OR workflow->>'calendar_needs_update' = '1'
), filtered AS (
  SELECT * FROM attention WHERE CASE $2
    WHEN 'overdue' THEN overdue
    WHEN 'today' THEN deadline = $1 AND NOT delivered
    WHEN 'contracts' THEN next_key IN ('contract_sent', 'signed')
    WHEN 'payments' THEN next_key IN ('deposit', 'deposit_receipt', 'balance', 'balance_receipt')
    WHEN 'editing' THEN next_key = 'editing_done'
    WHEN 'delivery' THEN next_key = 'delivered'
    WHEN 'reviews' THEN next_key = 'review_requested'
    WHEN 'calendar' THEN next_key = 'calendar_added' OR workflow->>'calendar_needs_update' = '1'
    ELSE true END
), totals AS (
  SELECT (SELECT count(*) FROM active WHERE day = $1 AND NOT shot)::int AS shoots_today,
    (SELECT count(*) FROM attention WHERE overdue)::int AS overdue_count,
    (SELECT count(*) FROM active WHERE deadline = $1 AND NOT delivered)::int AS due_today,
    (SELECT count(*) FROM attention)::int AS attention_count,
    count(*)::int AS filtered_count,
    greatest(1, least($3::int, ceil(count(*) / 20.0)::int)) AS page FROM filtered
), selected AS (
  (SELECT 'attention' AS section, f.* FROM filtered f
    ORDER BY overdue DESC, COALESCE(deadline, '9999'), id
    LIMIT 20 OFFSET (SELECT (page - 1) * 20 FROM totals))
  UNION ALL
  (SELECT 'upcoming' AS section, a.* FROM active a WHERE day >= $1 AND NOT shot
    ORDER BY workflow->>'scheduled', id LIMIT 10)
)
SELECT totals.*, COALESCE((SELECT json_agg(json_build_object('section', selected.section,
  'session', row_to_json(selected), 'payments', COALESCE((SELECT json_agg(p)
    FROM session_payments p WHERE p.session_id = selected.id), '[]'::json))) FROM selected), '[]'::json) AS bookings
FROM totals`;

export const overviewQuery = `${datedSessions}, classified AS (
  SELECT s.*, s.workflow->>'status' IS NOT DISTINCT FROM 'cancelled' AS cancelled,
    ${effective('shoot_done', present('shoot_done'))} AS shot FROM dated s
), completed AS (
  SELECT * FROM classified WHERE NOT cancelled AND shot AND left(day, 7) = $1
), packages AS (
  SELECT session_type || ' · חבילה ' || package_type AS name, count(*)::int AS count
  FROM completed GROUP BY session_type, package_type
)
SELECT
  (SELECT COALESCE(sum(amount), 0) FROM session_payments
    WHERE paid_on >= ($1 || '-01')::date AND paid_on < (($1 || '-01')::date + interval '1 month')) AS received,
  COALESCE(sum(to_pay) FILTER (WHERE NOT cancelled), 0) AS outstanding,
  COALESCE(sum(to_pay) FILTER (WHERE cancelled), 0) AS cancelled_balance,
  (SELECT count(*)::int FROM completed) AS completed,
  count(*) FILTER (WHERE NOT cancelled AND shot AND day = '')::int AS missing_dates,
  COALESCE((SELECT json_agg(json_build_array(name, count)) FROM packages), '[]'::json) AS packages
FROM classified`;
