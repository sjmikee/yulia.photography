import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../src/pages/clients/add_session.astro', import.meta.url), 'utf8');
const script = source.slice(source.indexOf('    function initAddSession()'), source.indexOf('    // Bulletproof init'));
function setup() {
  const fields = new Map();
  const field = (id) => {
    if (!fields.has(id))
      fields.set(id, {
        value: '',
        listeners: {},
        addEventListener(event, fn) {
          this.listeners[event] = fn;
        },
      });
    return fields.get(id);
  };
  const requests = [];
  let timer;
  vm.runInNewContext(`${script}\ninitAddSession();`, {
    document: { getElementById: field, querySelector: () => field('form') },
    PHONE: '',
    SELECTED_CLIENT: null,
    PRICING: {},
    alert() {},
    setTimeout: (fn) => {
      timer = fn;
      return 1;
    },
    clearTimeout: () => {
      timer = null;
    },
    fetch: () => new Promise((resolve, reject) => requests.push({ resolve, reject })),
  });
  const input = (phone) => {
    field('phone').value = phone;
    field('phone').listeners.input({ target: field('phone') });
  };
  const flush = async () => {
    await new Promise((resolve) => setImmediate(resolve));
  };
  const resolve = async (index, id) => {
    requests[index].resolve({ ok: true, json: async () => ({ id, name: `Client ${id}` }) });
    await flush();
  };
  return { field, requests, input, runTimer: () => timer?.(), resolve, flush };
}
test('editing a matched number immediately invalidates the client, and stale results cannot restore it', async () => {
  const app = setup();
  app.input('0501234567');
  app.runTimer();
  await app.resolve(0, 7);
  assert.equal(app.field('client_id').value, 7);
  app.input('0507654321');
  app.runTimer();
  assert.equal(app.field('client_id').value, '');
  app.input('050');
  await app.resolve(1, 8);
  assert.equal(app.field('client_id').value, '');
  let prevented = false;
  app.field('form').listeners.submit({
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
});
test('out-of-order searches keep the latest client and failed searches can retry the same phone', async () => {
  const app = setup();
  app.input('0501234567');
  app.runTimer();
  app.input('0507654321');
  app.runTimer();
  await app.resolve(1, 8);
  await app.resolve(0, 7);
  assert.equal(app.field('client_id').value, 8);
  app.input('0501234567');
  app.runTimer();
  app.requests[2].reject(new Error('offline'));
  await app.flush();
  assert.equal(app.field('client_id').value, '');
  app.input('0501234567');
  app.runTimer();
  await app.resolve(3, 7);
  assert.equal(app.field('client_id').value, 7);
});
