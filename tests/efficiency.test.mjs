import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

async function endpoint(path, dependencies) {
  const text = await readFile(new URL(`../src/pages/api/${path}.ts`, import.meta.url), 'utf8');
  const output = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, require: (id) => dependencies[id], Response, console };
  vm.runInNewContext(output, context);
  return context.exports.POST;
}

test('phone lookup returns optional bookings with one database round trip', async () => {
  let calls = 0;
  let result = [];
  const POST = await endpoint('get_client_by_phone', {
    '../../lib/db.ts': {
      sql: async () => {
        calls++;
        return result;
      },
    },
  });
  const invoke = (include_sessions) =>
    POST({
      request: new Request('https://example.test/api/get_client_by_phone', {
        method: 'POST',
        body: JSON.stringify({ phone: '0501234567', include_sessions }),
      }),
    });
  result = [{ id: 7, name: 'Client', email: '', sessions: [{ id: 42 }] }];
  assert.deepEqual(await (await invoke(true)).json(), result[0]);
  assert.equal(calls, 1);
  result = [{ id: 7, name: 'Client', email: '' }];
  assert.deepEqual(await (await invoke(false)).json(), result[0]);
  assert.equal(calls, 2);
  result = [];
  assert.equal((await invoke(true)).status, 404);
  assert.equal(calls, 3);
});

test('booking insertion returns 404 for absent clients and uses authoritative pricing in one query', async () => {
  let result = [];
  const queries = [];
  const POST = await endpoint('add_session', {
    '../../lib/db.ts': {
      sql: async (parts, ...values) => {
        queries.push({ text: parts.join('?'), values });
        return result;
      },
    },
    '../../lib/pricing': { PRICES: { family: { 1: 900 } } },
    '../../lib/session-duration': { packageDurationHours: () => 2 },
  });
  const invoke = () => {
    const body = new FormData();
    for (const [key, value] of Object.entries({
      client_id: '7',
      session_type: 'family',
      package_type: '1',
      additional_price: '50',
      price: '1',
    }))
      body.set(key, value);
    return POST({ request: new Request('https://example.test/api/add_session', { method: 'POST', body }) });
  };
  assert.equal((await invoke()).status, 404);
  assert.equal(queries.length, 1);
  result = [{ id: 42 }];
  const response = await invoke();
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/clients/7#session-42');
  assert.equal(queries.length, 2);
  assert.ok(queries[1].text.includes('FROM clients WHERE id ='));
  assert.deepEqual(queries[1].values, ['family', 1, 950, 950, '{"duration":"2"}', 7]);
});
