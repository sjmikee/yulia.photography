import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Run the actual browser submit handler with the named-control behavior of HTML forms.
const source = await readFile(new URL('../src/components/clients/SessionCard.astro', import.meta.url), 'utf8');
const start = source.indexOf("      card.querySelectorAll<HTMLFormElement>('[data-stage-toggle]')");
const end = source.indexOf('      const error =', start);
const handler = ts.transpileModule(source.slice(start, end), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;

for (const succeeds of [true, false]) {
  test(`toggle posts to the workflow endpoint despite the action field; save ${succeeds ? 'succeeds' : 'fails'}`, async () => {
    let submit;
    let checked = 'false';
    const status = { textContent: '' };
    const done = { value: '1' };
    const button = {
      disabled: false,
      getAttribute: () => checked,
      setAttribute: (_, value) => {
        checked = value;
      },
    };
    const form = {
      action: { name: 'action', value: 'correction', toString: () => '[object HTMLInputElement]' },
      querySelector: (selector) => (selector === 'button' ? button : done),
      addEventListener: (_, callback) => {
        submit = callback;
      },
    };
    const card = {
      dataset: { sessionId: '42' },
      querySelectorAll: (selector) => (selector === '[data-stage-toggle]' ? [form] : [button]),
      querySelector: () => status,
    };
    let requests = 0;
    vm.runInNewContext(handler, {
      card,
      location: { href: 'https://example.test/clients/7' },
      FormData: class {
        constructor(value) {
          assert.equal(value, form);
        }
      },
      fetch: async (url, options) => {
        requests++;
        if (requests === 1) {
          assert.equal(url, '/api/client_workflow');
          assert.equal(options.method, 'POST');
          assert.equal(options.headers.Accept, 'application/json');
          return { ok: succeeds, json: async () => ({ saved: true }) };
        }
        assert.equal(url, '/clients/session-card?session_id=42');
        assert.equal(options.cache, 'no-store');
        // Isolate saving from card rendering: a refresh failure must not undo a saved toggle.
        return { ok: false };
      },
    });
    await submit({ preventDefault() {} });
    assert.equal(requests, succeeds ? 2 : 1);
    assert.equal(checked, succeeds ? 'true' : 'false');
    assert.equal(button.disabled, false);
    assert.match(status.textContent, succeeds ? /הסימון נשמר/ : /השמירה נכשלה/);
    if (succeeds) assert.equal(done.value, '0');
  });
}
