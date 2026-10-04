export const manualSteps = [
  ['contract_sent', 'החוזה נשלח'],
  ['calendar_added', 'הסשן נוסף ליומן'],
  ['shoot_done', 'הצילומים הסתיימו'],
  ['editing_started', 'העריכה התחילה'],
  ['editing_done', 'העריכה הסתיימה'],
  ['pixieset_uploaded', 'התמונות המוקטנות הועלו ל־Pixieset'],
  ['fullsize_uploaded', 'התמונות המלאות הועלו ל־MyAirBridge'],
  ['delivered', 'הקישורים נשלחו ללקוח'],
  ['review_requested', 'הבקשה לביקורת נשלחה'],
] as const;
export type Workflow = Record<string, string | undefined>;
export type Client = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  session_count?: string;
};
export type Session = {
  id: number;
  client_id: number;
  session_type: string;
  package_type: number;
  session_price: string | number;
  to_pay: string | number;
  contract_signed: boolean;
  workflow: Workflow;
};
export type Payment = {
  session_id: number;
  id: string;
  stage: string;
  amount: number | string;
  receipt_status: string;
  receipt_url?: string;
  paid_on: string;
};
export function stepsFor(
  session: { workflow?: Workflow; contract_signed?: boolean; to_pay: number | string },
  payments: Payment[]
) {
  const w = session.workflow || {};
  const payment = (stage: string) => payments.find((p) => p.stage === stage);
  return [
    {
      key: 'contract_sent',
      label: 'הכנת חוזה לשליחה',
      done: !!w.contract_prepared || !!w.contract_sent || !!session.contract_signed,
    },
    { key: 'signed', label: 'המתנה לחתימת חוזה', done: !!session.contract_signed },
    { key: 'deposit', label: 'קבלת ₪100 לסגירת התאריך', done: !!payment('deposit') },
    { key: 'deposit_receipt', label: 'הפקת קבלה על ₪100', done: payment('deposit')?.receipt_status === 'issued' },
    { key: 'calendar_added', label: 'הוספה ליומן', done: !!w.calendar_added },
    { key: 'shoot_done', label: 'יום הצילומים', done: !!w.shoot_done },
    { key: 'balance', label: 'קבלת יתרת התשלום', done: Number(session.to_pay) === 0 },
    { key: 'balance_receipt', label: 'הפקת קבלה על היתרה', done: payment('balance')?.receipt_status === 'issued' },
    { key: 'editing_done', label: 'עריכת התמונות', done: !!w.editing_done },
    { key: 'delivered', label: 'העלאה ומסירת התמונות', done: !!w.delivered },
    { key: 'review_requested', label: 'בקשת ביקורת', done: !!w.review_requested },
  ].map((step) => ({
    ...step,
    done: w[`override_${step.key}`] === '1' ? true : w[`override_${step.key}`] === '0' ? false : step.done,
  }));
}
export function safeWebUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2000) throw new Error('Invalid URL');
  if (!value.trim()) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid URL');
  return url.toString();
}
export function validId(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid ID');
  return id;
}

/** Date-only arithmetic deliberately avoids daylight-saving transitions. */
export function israelToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(now);
}
export function validDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validScheduled(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value) && validDay(value.slice(0, 10));
}
export function deliveryDeadline(session: Pick<Session, 'workflow'>): string | undefined {
  const day = session.workflow?.scheduled?.slice(0, 10);
  if (!day || !validDay(day)) return undefined;
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 14);
  return date.toISOString().slice(0, 10);
}
export function isCancelled(session: Pick<Session, 'workflow'>): boolean {
  return session.workflow?.status === 'cancelled';
}
export function displayDay(day: string): string {
  return day.slice(0, 10).split('-').reverse().join('.');
}
export function deliveryLabel(deadline: string, today = israelToday()): string {
  const days = Math.round((Date.parse(`${deadline}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86400000);
  return days < 0 ? `באיחור של ${-days} ימים` : days === 0 ? 'למסירה היום' : `עוד ${days} ימים למסירה`;
}
export function clientDetails(form: FormData) {
  const name = String(form.get('name') || '').trim();
  let phone = String(form.get('phone') || '').replace(/\D/g, '');
  if (phone.startsWith('972')) phone = '0' + phone.slice(3);
  const email = String(form.get('email') || '').trim();
  if (
    !name ||
    name.length > 200 ||
    !/^05\d{8}$/.test(phone) ||
    email.length > 254 ||
    (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )
    throw new Error('Invalid client details');
  return { name, phone, email };
}
export type ManagedSession = Session & { client_name: string };
export function managementData(sessions: ManagedSession[], payments: Payment[], today = israelToday()) {
  const bySession = new Map<number, Payment[]>();
  for (const payment of payments) {
    const key = Number(payment.session_id);
    bySession.set(key, [...(bySession.get(key) || []), payment]);
  }
  const rows = sessions.map((session) => {
    const steps = stepsFor(session, bySession.get(Number(session.id)) || []);
    const done = (key: string) => !!steps.find((step) => step.key === key)?.done;
    const deadline = deliveryDeadline(session);
    const scheduled = session.workflow?.scheduled || '';
    const day = scheduled.slice(0, 10);
    return {
      session,
      steps,
      next: steps.find((step) => !step.done),
      deadline,
      scheduled,
      day: validDay(day) ? day : '',
      delivered: done('delivered'),
      shot: done('shoot_done'),
      overdue: !!deadline && deadline < today && !done('delivered'),
      cancelled: isCancelled(session),
    };
  });
  const active = rows.filter((row) => !row.cancelled);
  const upcoming = active
    .filter((row) => row.day >= today && !row.shot)
    .sort((a, b) => a.scheduled.localeCompare(b.scheduled) || a.session.id - b.session.id);
  const attention = active
    .filter((row) => row.next || row.overdue || row.session.workflow?.calendar_needs_update === '1')
    .sort(
      (a, b) =>
        Number(b.overdue) - Number(a.overdue) ||
        (a.deadline || '9999').localeCompare(b.deadline || '9999') ||
        a.session.id - b.session.id
    );
  return { rows, active, upcoming, attention };
}
export function businessSummary(sessions: ManagedSession[], payments: Payment[], month: string) {
  const { rows, active } = managementData(sessions, payments);
  const completed = active.filter((row) => row.shot && row.day.startsWith(month));
  const packages = new Map<string, number>();
  for (const { session } of completed) {
    const key = `${session.session_type} · חבילה ${session.package_type}`;
    packages.set(key, (packages.get(key) || 0) + 1);
  }
  const sumBalance = (items: typeof rows) =>
    items.reduce((sum, row) => sum + Math.round(Number(row.session.to_pay) * 100), 0) / 100;
  return {
    received:
      payments
        .filter((p) => p.paid_on.slice(0, 7) === month)
        .reduce((sum, p) => sum + Math.round(Number(p.amount) * 100), 0) / 100,
    outstanding: sumBalance(active),
    cancelledBalance: sumBalance(rows.filter((row) => row.cancelled)),
    completed: completed.length,
    missingDates: active.filter((row) => row.shot && !row.day).length,
    packages: [...packages].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  };
}
