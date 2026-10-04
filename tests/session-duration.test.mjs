import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/session-duration.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { packageDurationHours, packageDurationLabel, sessionDurationHours, durationOptions } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
);

test('every package reserves its contract maximum, including event package IDs that differ from hours', () => {
  for (const [id, hours] of [
    [1, 2],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 6],
    [6, 9],
  ]) {
    assert.equal(packageDurationHours(id), hours);
    assert.ok(durationOptions.includes(hours));
    assert.ok(packageDurationLabel(id));
    assert.equal(sessionDurationHours({ package_type: id }), hours);
  }
  assert.equal(packageDurationHours(99), undefined);
});

test('saved duration overrides survive reopening while missing or invalid values use the package', () => {
  assert.equal(sessionDurationHours({ package_type: 6, workflow: { duration: '2' } }), 2);
  for (const duration of ['', '0', 'bad', '5']) {
    assert.equal(sessionDurationHours({ package_type: 6, workflow: { duration } }), 9);
  }
  assert.equal(sessionDurationHours({ package_type: 2, workflow: null }), 3);
});
