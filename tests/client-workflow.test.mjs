import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
async function load(path, replacements = {}) {
  let source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to);
  return moduleUrl(
    ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
      .outputText
  );
}
const workflowUrl = await load('src/lib/client-workflow.ts');
const { stepsFor, safeWebUrl, validId } = await import(workflowUrl);
test('workflow distinguishes payment, receipt and signature; editing/delivery remain manual', () => {
  const session = { to_pay: 600, contract_signed: true, workflow: {} };
  const payment = { id: 'p', stage: 'deposit', amount: 100, receipt_status: 'pending' };
  let steps = stepsFor(session, [payment]);
  assert.equal(steps.find((s) => s.key === 'signed').done, true);
  assert.equal(steps.find((s) => s.key === 'deposit').done, true);
  assert.equal(steps.find((s) => s.key === 'deposit_receipt').done, false);
  assert.equal(steps.find((s) => !s.done).key, 'deposit_receipt');
  payment.receipt_status = 'issued';
  steps = stepsFor(session, [payment]);
  assert.equal(steps.find((s) => !s.done).key, 'calendar_added');
  assert.equal(steps.find((s) => s.key === 'delivered').done, false);
});
test('saved links and identifiers reject unsafe inputs', () => {
  for (const url of ['javascript:alert(1)', 'http://example.test', 'https://user:pass@example.test', 'nonsense'])
    assert.throws(() => safeWebUrl(url));
  assert.equal(safeWebUrl('https://gallery.pixieset.com/album'), 'https://gallery.pixieset.com/album');
  for (const id of [0, -1, 1.5, 'abc', Infinity]) assert.throws(() => validId(id));
});
const mockUrl = moduleUrl(`
export const state = { queries: [], record: null, claim: true, inserted: true, signed: false };
export async function sql(strings, ...values) {
 const text = strings.join('?'); state.queries.push({text, values});
 if (text.includes('SELECT p.*')) return state.record ? [{...state.record}] : [];
 if (text.includes("SET receipt_status = 'processing'")) { if (!state.claim) return []; state.claim = false; state.record.receipt_status = 'processing'; return [{id: 'p'}]; }
 if (text.includes("receipt_status = 'issued'")) { state.record.receipt_status = 'issued'; state.record.receipt_url = values[2]; return []; }
 if (text.includes('SELECT id FROM session_payments')) return [{id: 'test-payment'}];
 if (text.includes('SELECT contract_signed')) return [{contract_signed: state.signed}];
 if (text.includes('SELECT id FROM sessions')) return [{id: 42}];
 if (text.includes('WITH locked')) return state.inserted ? [{id: 42}] : [];
 return [];
}`);
const { state } = await import(mockUrl);
const receiptUrl = await load('src/pages/api/create_receipt.ts', {
  "'../../lib/db.ts'": JSON.stringify(mockUrl),
  'import.meta.env.MORNINGAPIKEY': "'test-key'",
  'import.meta.env.MORNINGAPISECRET': "'test-secret'",
  'import.meta.env.TINYTOKEN': "'test-tiny'",
});
const { POST: receipt } = await import(receiptUrl);
const paymentId = '11111111-1111-4111-8111-111111111111';
const invokeReceipt = () =>
  receipt({
    request: new Request('https://example.test/api/create_receipt', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId, payment: 1, description: 'Deposit', amount: 9999, phone: 'wrong' }),
    }),
  });
test('receipt uses recorded amount/client, serializes duplicate calls and never deducts balance twice', async () => {
  state.record = {
    amount: '100.00',
    name: 'Test',
    phone: '0501234567',
    email: 'test@example.test',
    paid_on: '2026-10-03',
    receipt_status: 'pending',
  };
  state.claim = true;
  state.queries = [];
  const originalFetch = globalThis.fetch;
  let documents = 0;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/account/token')) return Response.json({ token: 'test' });
    if (url.endsWith('/documents')) {
      documents++;
      const body = JSON.parse(options.body);
      assert.equal(body.payment[0].price, 100);
      assert.equal(body.payment[0].date, '2026-10-03');
      assert.equal(body.client.phone, '0501234567');
      return Response.json({ id: 'doc', number: 123, url: { he: 'https://example.test/receipt' } });
    }
    return Response.json({ data: { tiny_url: 'https://example.test/short' } });
  };
  try {
    const results = await Promise.all([invokeReceipt(), invokeReceipt()]);
    assert.ok(results.some((r) => r.status === 200));
    assert.equal(documents, 1);
    assert.equal((await invokeReceipt()).status, 200);
    assert.equal(documents, 1);
    assert.equal(
      state.queries.some((q) => q.text.includes('UPDATE sessions')),
      false
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test('uncertain provider outcome stays locked and prevents another receipt', async () => {
  state.record.receipt_status = 'pending';
  state.claim = true;
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  console.error = () => {};
  globalThis.fetch = async (url) => {
    if (url.endsWith('/account/token')) return Response.json({ token: 'test' });
    throw new Error('Connection lost after provider may have created document');
  };
  try {
    assert.equal((await invokeReceipt()).status, 500);
    assert.equal(state.record.receipt_status, 'processing');
    assert.equal((await invokeReceipt()).status, 409);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});
const endpointUrl = await load('src/pages/api/client_workflow.ts', {
  "'~/lib/db'": JSON.stringify(mockUrl),
  "'~/lib/client-workflow'": JSON.stringify(workflowUrl),
});
const { POST: update } = await import(endpointUrl);
function invokeUpdate(values) {
  const form = new FormData();
  for (const [k, v] of Object.entries({ client_id: '7', session_id: '42', ...values })) form.set(k, v);
  return update({
    request: new Request('https://example.test/api/client_workflow', { method: 'POST', body: form }),
    url: new URL('https://example.test/api/client_workflow'),
  });
}
test('payment writes use selected session and atomic duplicate/overpayment guards', async () => {
  state.queries = [];
  state.inserted = true;
  const response = await invokeUpdate({ action: 'payment', stage: 'deposit', amount: '100', paid_on: '2026-10-03' });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://example.test/clients/7#session-42');
  const query = state.queries.find((q) => q.text.includes('WITH locked'));
  assert.ok(query.text.includes('FOR UPDATE'));
  assert.ok(query.text.includes('ON CONFLICT(session_id, stage) DO NOTHING'));
  assert.ok(query.text.includes('to_pay >= '));
  assert.equal(query.values[0], 42);
  state.inserted = false;
  assert.ok(
    (await invokeUpdate({ action: 'payment', stage: 'deposit', amount: '100', paid_on: '2026-10-03' })).headers
      .get('location')
      .includes('error=payment')
  );
});
test('workflow endpoint rejects forged automatic steps and invalid deposits before mutation', async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    for (const values of [
      { action: 'step', step: 'contract_signed', done: '1' },
      { action: 'payment', stage: 'deposit', amount: '-100', paid_on: '2026-10-03' },
      { action: 'payment', stage: 'deposit', amount: '99', paid_on: '2026-10-03' },
    ]) {
      state.queries = [];
      assert.equal((await invokeUpdate(values)).status, 400);
      assert.equal(
        state.queries.some((q) => q.text.includes('UPDATE') || q.text.includes('INSERT')),
        false
      );
    }
  } finally {
    console.error = originalError;
  }
});

test('guided flow advances from recorded evidence and combines editing and uploads', () => {
  const s = { contract_signed: false, to_pay: 900, workflow: {} };
  const p = [];
  const next = () => stepsFor(s, p).find((step) => !step.done)?.key;
  assert.equal(next(), 'contract_sent');
  s.workflow.contract_prepared = '2026-10-03';
  assert.equal(next(), 'signed');
  s.contract_signed = true;
  assert.equal(next(), 'deposit');
  p.push({ stage: 'deposit', receipt_status: 'pending' });
  s.to_pay = 800;
  assert.equal(next(), 'deposit_receipt');
  p[0].receipt_status = 'issued';
  assert.equal(next(), 'calendar_added');
  s.workflow.calendar_added = '2026-10-03';
  assert.equal(next(), 'shoot_done');
  s.workflow.shoot_done = '2026-10-03';
  assert.equal(next(), 'balance');
  p.push({ stage: 'balance', receipt_status: 'pending' });
  s.to_pay = 0;
  assert.equal(next(), 'balance_receipt');
  p[1].receipt_status = 'issued';
  assert.equal(next(), 'editing_done');
  s.workflow.editing_done = '2026-10-03';
  assert.equal(next(), 'delivered');
  s.workflow.delivery_prepared = '2026-10-03';
  assert.equal(next(), 'delivered', 'preparing WhatsApp is not proof of sending');
  s.workflow.delivered = '2026-10-03';
  assert.equal(next(), 'review_requested');
  s.workflow.review_requested = '2026-10-03';
  assert.equal(next(), undefined);
});

test('recording payment can continue directly to its receipt', async () => {
  state.inserted = true;
  state.queries = [];
  const response = await invokeUpdate({
    action: 'payment',
    stage: 'deposit',
    amount: '100',
    paid_on: '2026-10-03',
    continue: 'receipt',
  });
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://example.test/clients/send_reciept?payment_id=test-payment');
  const query = state.queries.find((q) => q.text.includes('SELECT id FROM session_payments'));
  assert.deepEqual(query.values, [42, 'deposit']);
});

test('preparing delivery stores only the gallery and does not mark delivery complete', async () => {
  state.queries = [];
  const response = await invokeUpdate({
    action: 'delivery',
    pixieset: 'https://example.test/gallery',
    airbridge: 'https://example.test/temporary',
  });
  assert.equal(response.status, 303);
  const query = state.queries.find((q) => q.text.includes('UPDATE sessions'));
  const data = JSON.parse(query.values[0]);
  assert.equal(data.pixieset, 'https://example.test/gallery');
  assert.ok(data.delivery_prepared);
  assert.equal(data.delivered, undefined);
  assert.equal(JSON.stringify(query).includes('temporary'), false);
});

const statusUrl = await load('src/pages/api/session_status.ts', {
  "'~/lib/db'": JSON.stringify(mockUrl),
  "'~/lib/client-workflow'": JSON.stringify(workflowUrl),
});
const { GET: getStatus } = await import(statusUrl);
test('signature refresh exposes only the selected booking signature status', async () => {
  state.signed = false;
  let response = await getStatus({ url: new URL('https://example.test/api/session_status?session_id=42') });
  assert.deepEqual(await response.json(), { signed: false });
  state.signed = true;
  response = await getStatus({ url: new URL('https://example.test/api/session_status?session_id=42') });
  assert.deepEqual(await response.json(), { signed: true });
  assert.equal(
    (await getStatus({ url: new URL('https://example.test/api/session_status?session_id=bad') })).status,
    400
  );
});

test('manual payment completion records an issued receipt without a provider call and keeps duplicate guards', async () => {
  state.inserted = true;
  for (const stage of ['deposit', 'balance']) {
    state.queries = [];
    const response = await invokeUpdate({
      action: 'payment',
      stage,
      amount: stage === 'deposit' ? '100' : '600',
      paid_on: '2026-10-03',
      continue: 'done',
    });
    assert.equal(response.headers.get('location'), 'https://example.test/clients/7#session-42');
    const query = state.queries.find((q) => q.text.includes('WITH locked'));
    assert.ok(query.values.includes('issued'));
    assert.ok(query.text.includes('ON CONFLICT(session_id, stage) DO NOTHING'));
    assert.ok(query.text.includes('s.to_pay - p.amount'));
  }
  state.inserted = false;
  const duplicate = await invokeUpdate({
    action: 'payment',
    stage: 'deposit',
    amount: '100',
    paid_on: '2026-10-03',
    continue: 'done',
  });
  assert.ok(duplicate.headers.get('location').includes('error=payment'));
});

test('manual receipt completion only updates pending receipts for the selected session and never deducts payment', async () => {
  state.queries = [];
  const response = await invokeUpdate({ action: 'receipt_done', stage: 'deposit' });
  assert.equal(response.status, 303);
  const query = state.queries.find((q) => q.text.includes('UPDATE session_payments'));
  assert.deepEqual(query.values, [42, 'deposit']);
  assert.ok(query.text.includes("receipt_status = 'pending'"));
  assert.equal(
    state.queries.some((q) => q.text.includes('UPDATE sessions')),
    false
  );
});
