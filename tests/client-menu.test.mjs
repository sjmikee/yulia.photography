import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const page = await readFile(new URL('../src/pages/clients/[id].astro', import.meta.url), 'utf8');
const script = ts.transpileModule(
  page.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/import .*focus-client-field';/, ''),
  {}
).outputText;

function setup() {
  const nodes = {};
  let focused;
  function node(id) {
    const handlers = {};
    return (nodes[id] = {
      dataset: {},
      hidden: true,
      disabled: true,
      attributes: {},
      addEventListener(type, fn) {
        (handlers[type] ??= []).push(fn);
      },
      removeEventListener() {},
      fire(type, event = {}) {
        for (const fn of handlers[type] ?? []) fn(event);
      },
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      focus() {
        focused = id;
      },
      reset() {},
      querySelector(selector) {
        return nodes[selector];
      },
      contains(target) {
        return ['#client-actions', '#client-actions-toggle', '#client-actions-menu', '#edit-client'].some(
          (key) => nodes[key] === target
        );
      },
    });
  }
  for (const id of [
    '#edit-client',
    '#client-editor',
    '#client-actions',
    '#client-actions-toggle',
    '#client-actions-menu',
    'fieldset',
    '[name="name"]',
    '#cancel-client-edit',
    'document',
  ])
    node(id);
  runInNewContext(script, { document: nodes.document, focusClientField: (field) => field?.focus() });
  return { nodes, focused: () => focused };
}

test('touch blur does not dismiss the edit option before its click', () => {
  const { nodes: n, focused } = setup();
  n['#client-actions-toggle'].fire('click', { detail: 1 });
  assert.equal(n['#client-actions-menu'].hidden, false);
  assert.equal(focused(), undefined);
  n['#client-actions'].fire('focusout', { relatedTarget: null });
  assert.equal(n['#client-actions-menu'].hidden, false);
  n['#edit-client'].fire('click');
  assert.equal(n['#client-actions-menu'].hidden, true);
  assert.equal(n['#client-editor'].hidden, false);
  assert.equal(n.fieldset.disabled, false);
  assert.equal(focused(), '[name="name"]');
});

test('keyboard activation, Escape, outside taps and tabbing away dismiss correctly', () => {
  const { nodes: n, focused } = setup();
  const open = () => n['#client-actions-toggle'].fire('click', { detail: 0 });
  open();
  assert.equal(focused(), '#edit-client');
  n['#client-actions'].fire('keydown', { key: 'Escape' });
  assert.equal(n['#client-actions-menu'].hidden, true);
  assert.equal(focused(), '#client-actions-toggle');
  open();
  n.document.fire('click', { target: n['#client-editor'] });
  assert.equal(n['#client-actions-menu'].hidden, true);
  open();
  n['#client-actions'].fire('focusout', { relatedTarget: n['#client-editor'] });
  assert.equal(n['#client-actions-menu'].hidden, true);
});
