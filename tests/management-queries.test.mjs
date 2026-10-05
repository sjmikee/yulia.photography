import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
async function load(path) {
  const source = await readFile(new URL(`../src/lib/${path}.ts`, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const { dashboardQuery, overviewQuery } = await load('management-queries');
const { managementData, businessSummary, stepsFor } = await load('client-workflow');

test('PostgreSQL dashboard pagination and overview aggregates match the existing workflow calculations', async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE clients (id integer PRIMARY KEY, name text);
      CREATE TABLE sessions (id integer PRIMARY KEY, client_id integer, session_type text, package_type integer,
        session_price numeric(12,2), to_pay numeric(12,2), contract_signed boolean, workflow jsonb);
      CREATE TABLE session_payments (id text, session_id integer, stage text, amount numeric(12,2), paid_on date, receipt_status text);
      INSERT INTO clients VALUES (1, 'Test');`);
    const empty = (await db.query(dashboardQuery, ['2026-10-05', 'all', 1])).rows[0];
    assert.equal(empty.page, 1);
    assert.equal(empty.filtered_count, 0);
    assert.deepEqual(empty.bookings, []);
    assert.equal(Number((await db.query(overviewQuery, ['2026-10'])).rows[0].received), 0);
    const sessions = [];
    const payments = [];
    const keys = stepsFor({ workflow: {}, to_pay: 0, contract_signed: false }, []).map((step) => step.key);
    const days = [
      '2026-09-01',
      '2026-09-21',
      '2026-10-05',
      '2026-10-06',
      '2026-12-31',
      '2026-02-30',
      '2024-02-29',
      '2026-02-29',
      'bad',
      '',
      '2026-13-01',
      '2026-01-00',
    ];
    // A deterministic spread of evidence, corrections, cancellations, payment states and dates.
    let seed = 42;
    const random = (n) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed % n;
    };
    for (let id = 1; id <= 300; id++) {
      const workflow = { scheduled: `${days[id % days.length]}T10:00` };
      for (const key of keys) {
        if (random(3)) workflow[key] = '2026-10-01';
        const override = random(5);
        if (override < 2) workflow[`override_${key}`] = String(override);
      }
      if (id > 250) {
        for (const key of keys) workflow[`override_${key}`] = '1';
        if (id < 295) workflow[`override_${keys[(id - 251) % keys.length]}`] = '0';
        workflow.scheduled = '2026-10-05T10:00';
      }
      if (id % 7 === 0) workflow.status = 'cancelled';
      if (id % 11 === 0) workflow.calendar_needs_update = '1';
      if (id % 13 === 0) workflow.contract_prepared = '2026-10-01';
      const session = {
        id,
        client_id: 1,
        client_name: 'Test',
        session_type: id % 2 ? 'family' : 'personal',
        package_type: (id % 3) + 1,
        session_price: 999.99,
        to_pay: id % 3 ? 799.99 : 0,
        contract_signed: id % 2 === 0,
        workflow,
      };
      sessions.push(session);
      await db.query('INSERT INTO sessions VALUES ($1, 1, $2, $3, $4, $5, $6, $7)', [
        id,
        session.session_type,
        session.package_type,
        session.session_price,
        session.to_pay,
        session.contract_signed,
        workflow,
      ]);
      for (const stage of ['deposit', 'balance']) {
        if (random(4) === 0) continue;
        const p = {
          id: `${id}-${stage}`,
          session_id: id,
          stage,
          amount: stage === 'deposit' ? 100 : 799.99,
          receipt_status: ['pending', 'processing', 'issued'][random(3)],
          paid_on: id % 2 ? '2026-10-01' : '2026-09-30',
        };
        payments.push(p);
        await db.query('INSERT INTO session_payments VALUES ($1, $2, $3, $4, $5, $6)', [
          p.id,
          id,
          stage,
          p.amount,
          p.paid_on,
          p.receipt_status,
        ]);
      }
    }
    const today = '2026-10-05';
    const data = managementData(sessions, payments, today);
    const filters = {
      all: () => true,
      overdue: (r) => r.overdue,
      today: (r) => r.deadline === today && !r.delivered,
      contracts: (r) => ['contract_sent', 'signed'].includes(r.next?.key),
      payments: (r) => ['deposit', 'deposit_receipt', 'balance', 'balance_receipt'].includes(r.next?.key),
      editing: (r) => r.next?.key === 'editing_done',
      delivery: (r) => r.next?.key === 'delivered',
      reviews: (r) => r.next?.key === 'review_requested',
      calendar: (r) => r.next?.key === 'calendar_added' || r.session.workflow.calendar_needs_update === '1',
    };
    for (const [filter, predicate] of Object.entries(filters)) {
      const filtered = data.attention.filter(predicate);
      for (const requested of [1, 2, 100000]) {
        const result = (await db.query(dashboardQuery, [today, filter, requested])).rows[0];
        const page = Math.max(1, Math.min(requested, Math.ceil(filtered.length / 20)));
        assert.equal(result.page, page, `${filter} page`);
        assert.equal(result.filtered_count, filtered.length, `${filter} count`);
        assert.equal(result.shoots_today, data.upcoming.filter((r) => r.day === today).length);
        assert.equal(result.overdue_count, data.attention.filter((r) => r.overdue).length);
        assert.equal(result.due_today, data.active.filter((r) => r.deadline === today && !r.delivered).length);
        assert.equal(result.attention_count, data.attention.length);
        for (const [section, expected] of [
          ['attention', filtered.slice((page - 1) * 20, page * 20)],
          ['upcoming', data.upcoming.slice(0, 10)],
        ]) {
          const bookings = result.bookings.filter((b) => b.section === section);
          const actual = managementData(
            bookings.map((b) => b.session),
            bookings.flatMap((b) => b.payments),
            today
          )[section];
          assert.deepEqual(
            actual.map((r) => r.session.id),
            expected.map((r) => r.session.id),
            `${filter} ${section}`
          );
          for (const booking of bookings) {
            const original = data.rows.find((r) => r.session.id === booking.session.id);
            assert.equal(booking.session.next_key, original.next?.key ?? null);
            assert.equal(booking.session.deadline, original.deadline ?? null);
            assert.equal(booking.session.day, original.day);
          }
        }
        assert.ok(
          result.bookings.length <= 30,
          'only the visible work and upcoming bookings cross the database boundary'
        );
      }
    }
    for (const month of ['2026-09', '2026-10', '2024-02', '2027-01']) {
      const result = (await db.query(overviewQuery, [month])).rows[0];
      const actual = {
        received: Number(result.received),
        outstanding: Number(result.outstanding),
        cancelledBalance: Number(result.cancelled_balance),
        completed: result.completed,
        missingDates: result.missing_dates,
        packages: result.packages.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
      };
      assert.deepEqual(actual, businessSummary(sessions, payments, month));
    }
  } finally {
    await db.close();
  }
});
