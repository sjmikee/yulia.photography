import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const source = await readFile(new URL('../src/components/clients/FormBehavior.astro', import.meta.url), 'utf8');
const script = ts.transpileModule(source.slice(source.indexOf('  const snapshots'), source.indexOf('</script>')), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
function setup(method = 'POST') {
  const events = {};
  let confirmations = 0;
  class Element {
    closest() {
      return form;
    }
  }
  class Input extends Element {
    name = 'name';
    type = 'text';
    value = 'Original';
    autocomplete = 'off';
  }
  const field = new Input();
  const form = new Element();
  Object.assign(form, {
    method,
    isConnected: true,
    elements: [field],
    getAttribute: () => method,
    querySelectorAll: (selector) => (selector === 'input, select, textarea' ? [field] : []),
  });
  const register = (name, fn) => {
    events[name] = fn;
  };
  vm.runInNewContext(script, {
    Element,
    HTMLInputElement: Input,
    HTMLSelectElement: class {},
    HTMLTextAreaElement: class {},
    document: {
      addEventListener: register,
      querySelectorAll: (selector) => (selector.includes('details') ? [] : [form]),
      querySelector: () => null,
    },
    window: {
      addEventListener: register,
      confirm: () => {
        confirmations++;
        return false;
      },
    },
    location: { href: 'https://example.test/clients/7' },
    URL,
    queueMicrotask,
    setTimeout,
  });
  const edit = () => {
    events.focusin({ target: field });
    field.value = 'Edited';
    events.input({ target: field });
  };
  const navigate = (formData) => {
    const event = {
      sourceElement: formData ? form : null,
      formData,
      preventDefault() {
        this.cancelled = true;
      },
    };
    events['astro:before-preparation'](event);
    return event;
  };
  return { edit, navigate, events, form, field, confirmations: () => confirmations };
}
test('unsaved edits block navigation; successful save clears the guard', () => {
  const app = setup();
  app.edit();
  assert.equal(app.navigate().cancelled, true);
  app.events['client:form-saved']({ target: app.form });
  assert.equal(app.navigate().cancelled, undefined);
  assert.equal(app.confirmations(), 1);
});
test('failed saves retain protection and native form submission is permitted', () => {
  const app = setup();
  app.edit();
  // No success event is emitted on failure.
  assert.equal(app.navigate().cancelled, true);
  assert.equal(app.navigate({}).cancelled, undefined);
});
test('GET filters and untouched programmatic prefills do not warn', () => {
  const filter = setup('GET');
  filter.edit();
  assert.equal(filter.navigate().cancelled, undefined);
  const prefilled = setup();
  prefilled.field.value = 'Prefilled';
  assert.equal(prefilled.navigate().cancelled, undefined);
});
