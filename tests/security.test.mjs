import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
async function loadSource(path, replacements = {}) {
  let source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to);
  return moduleUrl(
    ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
      .outputText
  );
}
const signedUrl = await loadSource('src/lib/signed-token.ts', {
  'import.meta.env.SESSION_SECRET': "'test-secret-only'",
});
const sessionUrl = await loadSource('src/lib/session.ts', { "'./signed-token'": JSON.stringify(signedUrl) });
const contractUrl = await loadSource('src/lib/contract-token.ts', { "'./signed-token'": JSON.stringify(signedUrl) });
const { signToken } = await import(signedUrl);
const { createSessionCookie, verifySessionCookie } = await import(sessionUrl);
const { createContractToken, verifyContractToken } = await import(contractUrl);
const invitationId = '11111111-1111-4111-8111-111111111111';
const makeToken = () => createContractToken(42, '0501234567', '0', invitationId, Date.now() + 86400000);
const middlewareUrl = await loadSource('src/middleware.ts', {
  "'astro:middleware'": JSON.stringify(moduleUrl('export const defineMiddleware = fn => fn;')),
  "'~/lib/session'": JSON.stringify(sessionUrl),
});
const { onRequest } = await import(middlewareUrl);

await test('sessions accept valid tokens and reject expired, malformed and tampered tokens', async () => {
  const token = await createSessionCookie('admin');
  assert.equal(await verifySessionCookie(token), 'admin');
  for (const invalid of [
    '',
    'bad.token',
    `${token}.extra`,
    `x${token}`,
    await signToken({ purpose: 'session', username: 'admin', expiresAt: Date.now() - 1 }),
  ]) {
    assert.equal(await verifySessionCookie(invalid), false);
  }
  const ordinary = JSON.parse(Buffer.from(token.split('.')[0], 'base64url'));
  const remembered = JSON.parse(Buffer.from((await createSessionCookie('admin', true)).split('.')[0], 'base64url'));
  assert.ok(Math.abs(ordinary.expiresAt - Date.now() - 2 * 3600000) < 1000);
  assert.ok(Math.abs(remembered.expiresAt - Date.now() - 30 * 86400000) < 1000);
});

await test('contract invitations are scoped to booking, phone and consent and cannot authenticate admins', async () => {
  const token = await makeToken();
  assert.deepEqual(await verifyContractToken(token), {
    invitationId,
    sessionId: 42,
    phone: '0501234567',
    conf: '0',
    locale: 'he',
    contractVersion: '1',
  });
  assert.equal(await verifySessionCookie(token), false);
  assert.equal(await verifyContractToken(await createSessionCookie('admin')), null);
  const expired = await signToken({
    purpose: 'contract',
    sessionId: 42,
    phone: '0501234567',
    conf: '0',
    expiresAt: Date.now() - 1,
  });
  assert.equal(await verifyContractToken(expired), null);
});

await test('admin APIs reject anonymous requests, including trailing slash and login-prefix bypasses', async () => {
  const invoke = (path, token = '') =>
    onRequest(
      {
        request: new Request(`https://example.test${path}`),
        cookies: { get: () => ({ value: token }), delete: () => {} },
        redirect: (location) => new Response(null, { status: 302, headers: { Location: location } }),
      },
      () => new Response('allowed')
    );
  for (const path of [
    '/api/add_client',
    '/api/client_workflow',
    '/api/session_status',
    '/api/add_session/',
    '/api/create_receipt',
    '/api/get_client_by_phone',
    '/api/get_client_for_receipt',
    '/api/create_contract_link',
    '/api/login-extra',
  ]) {
    assert.equal((await invoke(path)).status, 401, path);
    assert.equal((await invoke(path, await createSessionCookie('admin'))).status, 200, path);
  }
  assert.equal((await invoke('/clients')).status, 302);
  for (const path of ['/', '/contract', '/api/login', '/api/get_price', '/api/submit_contract'])
    assert.equal((await invoke(path)).status, 200, path);
});

await test('private middleware preserves immutable redirects and response bodies when adding headers', async () => {
  const token = await createSessionCookie('admin');
  const location = 'https://example.test/clients/7#session-42';
  for (const path of ['/api/client_workflow', '/clients/7']) {
    for (const original of [
      Response.redirect(location, 303),
      new Response('saved', {
        status: 201,
        headers: { 'Content-Type': 'text/plain', 'Set-Cookie': 'test=value; HttpOnly' },
      }),
    ]) {
      const response = await onRequest(
        {
          request: new Request(`https://example.test${path}`),
          cookies: { get: () => ({ value: token }), delete: () => {} },
        },
        () => original
      );
      assert.equal(response.status, original.status);
      assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
      assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
      if (original.status === 303) {
        assert.equal(response.headers.get('Location'), location);
        assert.equal(await response.text(), '');
      } else {
        assert.equal(response.headers.get('Content-Type'), 'text/plain');
        assert.equal(response.headers.get('Set-Cookie'), 'test=value; HttpOnly');
        assert.equal(await response.text(), 'saved');
      }
    }
  }
});

const mockUrl = moduleUrl(`
export const state = { writes: 0, mailError: false, badPdf: false, sent: 0, queries: [], status: 'pending', expires_at: new Date(Date.now() + 86400000).toISOString(), failCommit: false };
export function sql(strings, ...values) {
  const text = strings.join('?');
  const query = { text, values, then(resolve, reject) { return Promise.resolve().then(() => execute(query)).then(resolve, reject); } };
  return query;
}
function execute(query) {
  state.queries.push(query);
  const text = query.text;
  if (text.includes("SET status = 'processing'")) {
    if (!text.includes("status = 'pending'") || !text.includes('expires_at > NOW()')) throw new Error('Unconditional claim');
    if (state.status !== 'pending' || new Date(state.expires_at) <= new Date()) return [];
    state.status = 'processing';
    return [{ id: '11111111-1111-4111-8111-111111111111' }];
  }
  if (text.includes('UPDATE')) { state.writes++; return []; }
  return [{ id: 42, session_price: 500, package_type: 1, status: state.status, expires_at: state.expires_at }];
}
sql.transaction = async (queries) => {
  if (state.failCommit) throw new Error('Commit unavailable');
  for (const query of queries) execute(query);
  state.status = 'signed';
};
export class Resend { emails = { send: async (message) => { state.message = message; state.sent++; return { error: state.mailError ? { message: 'rejected' } : null }; } }; }
export const PDFDocument = { load: async () => {
 if (state.badPdf) throw new Error('Invalid PDF');
 return { setLanguage() {}, setSubject() {}, getForm: () => ({ getTextField: () => ({ setText() {}, updateAppearances() {} }), flatten() {} }), registerFontkit() {}, getPages: () => [{}, { drawImage() {} }], embedFont: async () => ({}), embedPng: async () => ({}), save: async () => new Uint8Array([1]) };
} };
export default {};
`);
const { state } = await import(mockUrl);
const presentationUrl = await loadSource('src/lib/contract-presentation.ts');
const emailUrl = await loadSource('src/lib/contract-email.ts');
const durationUrl = await loadSource('src/lib/session-duration.ts');
const invitationUrl = await loadSource('src/lib/contract-invitation.ts', { "'./db'": JSON.stringify(mockUrl) });
const handlerUrl = await loadSource('src/pages/api/submit_contract.ts', {
  "'../../lib/contract-token'": JSON.stringify(contractUrl),
  "'../../lib/contract-presentation'": JSON.stringify(presentationUrl),
  "'../../lib/contract-email'": JSON.stringify(emailUrl),
  "'../../lib/contract-invitation'": JSON.stringify(invitationUrl),
  "'../../lib/session-duration'": JSON.stringify(durationUrl),
  "'../../lib/db.ts'": JSON.stringify(mockUrl),
  "'@pdf-lib/fontkit'": JSON.stringify(mockUrl),
  "'pdf-lib'": JSON.stringify(mockUrl),
  "'resend'": JSON.stringify(mockUrl),
  'import.meta.env.RESEND_API_KEY': "'test-key'",
});
const { POST } = await import(handlerUrl);
await test('single-use signing handles PDF failures, uncertain delivery, concurrent submissions and replay', async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  globalThis.fetch = async () => new Response(new Uint8Array([1]));
  console.error = () => {};
  try {
    async function submit(token) {
      const form = new FormData();
      for (const [key, value] of Object.entries({
        token,
        name: 'Test',
        email: 'test@example.test',
        phone: 'attacker-supplied',
        conf: '1',
        id: '123',
        address: 'Test',
        signature: 'AQ==',
      }))
        form.set(key, value);
      return POST({
        request: new Request('https://example.test/api/submit_contract', { method: 'POST', body: form }),
        url: new URL('https://example.test/api/submit_contract'),
        redirect: (url, status) => new Response(null, { status, headers: { Location: url } }),
      });
    }
    assert.equal((await submit('')).status, 403);
    assert.equal(state.queries.length, 0);
    const token = await makeToken();
    state.badPdf = true;
    assert.equal((await submit(token)).status, 500);
    assert.equal(state.writes, 0);
    assert.equal(state.sent, 0);
    state.badPdf = false;
    state.mailError = true;
    assert.equal((await submit(token)).status, 502);
    assert.equal(state.writes, 0);
    assert.equal(state.status, 'processing');
    const sentBeforeRetry = state.sent;
    assert.equal((await submit(token)).status, 409);
    assert.equal(state.sent, sentBeforeRetry);
    // Simulate an administrator reconciling the failed delivery and issuing a fresh invitation.
    state.status = 'pending';
    state.mailError = false;
    const responses = await Promise.all([submit(token), submit(token)]);
    assert.deepEqual(responses.map((r) => r.status).sort(), [303, 409]);
    const success = responses.find((r) => r.status === 303);
    assert.equal(success.status, 303);
    assert.equal(success.headers.get('Location'), '/thank_you');
    assert.equal(state.writes, 3);
    assert.equal(state.status, 'signed');
    assert.equal(state.sent, sentBeforeRetry + 1);
    assert.equal((await submit(token)).status, 409);
    assert.equal(state.sent, sentBeforeRetry + 1);
    // A database failure after email acceptance must not unlock the invitation.
    state.status = 'pending';
    state.failCommit = true;
    assert.equal((await submit(token)).status, 500);
    assert.equal(state.status, 'processing');
    const sentAfterCommitFailure = state.sent;
    assert.equal((await submit(token)).status, 409);
    assert.equal(state.sent, sentAfterCommitFailure);
    state.failCommit = false;
    assert.deepEqual(state.queries[0].values, [invitationId, 42, '0501234567']);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});

await test('public price lookup requires an invitation and ignores arbitrary phone parameters', async () => {
  const priceUrl = await loadSource('src/pages/api/get_price.ts', {
    "'../../lib/contract-token'": JSON.stringify(contractUrl),
    "'../../lib/contract-presentation'": JSON.stringify(presentationUrl),
    "'../../lib/contract-email'": JSON.stringify(emailUrl),
    "'../../lib/contract-invitation'": JSON.stringify(invitationUrl),
    "'../../lib/session-duration'": JSON.stringify(durationUrl),
  });
  const { GET } = await import(priceUrl);
  const invoke = (query) => GET({ request: new Request(`https://example.test/api/get_price?${query}`) });
  assert.equal((await invoke('phone=0501234567')).status, 403);
  const token = await makeToken();
  for (const status of ['signed', 'processing', 'revoked']) {
    state.status = status;
    const blocked = await invoke(`token=${token}`);
    assert.equal((await blocked.json()).code, status);
  }
  state.status = 'pending';
  state.expires_at = new Date(Date.now() - 1000).toISOString();
  assert.equal((await (await invoke(`token=${token}`)).json()).code, 'expired');
  state.expires_at = new Date(Date.now() + 86400000).toISOString();
  const response = await invoke(`phone=0509999999&token=${token}`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).phone, '0501234567');
  assert.deepEqual(state.queries.at(-1).values, [invitationId, 42, '0501234567']);
});

await test('issuing an invitation stores its ID and expiry in the token and blocks replacement during processing', async () => {
  const issuanceMockUrl = moduleUrl(`
    export const state = { processing: false, queries: [] };
    export function sql(strings, ...values) {
      const text = strings.join('?');
      state.queries.push({ text, values });
      if (text.includes('SELECT s.id')) return Promise.resolve([{ id: 42 }]);
      return { text, values };
    }
    sql.transaction = async queries => {
      if (!queries[0].text.includes('FOR UPDATE')) throw new Error('Missing booking lock');
      if (!queries[1].text.includes("status = 'pending'")) throw new Error('Unsafe revocation');
      if (!queries[2].text.includes("status = 'processing'")) throw new Error('Missing processing guard');
      return [[], [], state.processing ? [] : [{ id: '${invitationId}', expires_at: new Date(Date.now() + 86400000).toISOString() }]];
    };
  `);
  const { state: issuanceState } = await import(issuanceMockUrl);
  const route = await loadSource('src/pages/api/create_contract_link.ts', {
    "'../../lib/db'": JSON.stringify(issuanceMockUrl),
    "'../../lib/contract-token'": JSON.stringify(contractUrl),
    "'../../lib/contract-presentation'": JSON.stringify(presentationUrl),
    "'../../lib/contract-email'": JSON.stringify(emailUrl),
  });
  const { POST: issue } = await import(route);
  const invoke = (locale) =>
    issue({
      request: new Request('https://example.test/api/create_contract_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '0501234567',
          conf: '0',
          session_id: 42,
          ...(locale === undefined ? {} : { locale }),
        }),
      }),
      url: new URL('https://example.test/api/create_contract_link'),
    });
  const response = await invoke();
  assert.equal(response.status, 200);
  const link = new URL((await response.json()).url);
  assert.equal(link.origin, 'https://example.test');
  const invitation = await verifyContractToken(link.searchParams.get('token'));
  assert.equal(invitation.invitationId, invitationId);
  assert.equal(invitation.sessionId, 42);
  const selectedQuery = issuanceState.queries.find((q) => q.text.includes('SELECT s.id'));
  assert.ok(selectedQuery.text.includes('s.id = ?'));
  assert.deepEqual(selectedQuery.values, ['0501234567', false, 42]);
  assert.ok(
    issuanceState.queries.some(
      (q) => q.text.includes('UPDATE sessions') && String(q.values[0]).includes('contract_prepared')
    )
  );
  const queryCount = issuanceState.queries.length;
  assert.equal((await invoke('en')).status, 400);
  assert.equal(issuanceState.queries.length, queryCount);
  const russianLink = new URL((await (await invoke('ru')).json()).url);
  assert.equal(russianLink.pathname, '/ru/contract');
  const russianInvitation = await verifyContractToken(russianLink.searchParams.get('token'));
  assert.equal(russianInvitation.locale, 'ru');
  assert.equal(russianInvitation.contractVersion, '1');
  issuanceState.processing = true;
  assert.equal((await invoke()).status, 409);
  const legacyToken = await signToken({
    purpose: 'contract',
    sessionId: 42,
    phone: '0501234567',
    conf: '0',
    expiresAt: Date.now() + 86400000,
  });
  assert.equal(await verifyContractToken(legacyToken), null);
});

await test('contract language/version is signed, old invitations remain Hebrew and unknown claims fail closed', async () => {
  const base = {
    purpose: 'contract',
    sessionId: 42,
    phone: '0501234567',
    conf: '1',
    invitationId,
    expiresAt: Date.now() + 86400000,
  };
  assert.equal((await verifyContractToken(await signToken(base))).locale, 'he');
  const ru = await createContractToken(42, base.phone, '1', invitationId, base.expiresAt, 'ru');
  assert.equal((await verifyContractToken(ru)).locale, 'ru');
  for (const claims of [
    { locale: 'en', contractVersion: '1' },
    { locale: 'ru', contractVersion: '2' },
    { locale: 'ru' },
    { contractVersion: '1' },
    { locale: ['ru'], contractVersion: '1' },
  ])
    assert.equal(await verifyContractToken(await signToken({ ...base, ...claims })), null);
  const [encoded, signature] = ru.split('.');
  const tampered = { ...JSON.parse(Buffer.from(encoded, 'base64url')), locale: 'he' };
  assert.equal(
    await verifyContractToken(`${Buffer.from(JSON.stringify(tampered)).toString('base64url')}.${signature}`),
    null
  );
});

await test('Russian price preview selects the signed language, duration and publication variant', async () => {
  const { GET } = await import(
    await loadSource('src/pages/api/get_price.ts', {
      "'../../lib/contract-token'": JSON.stringify(contractUrl),
      "'../../lib/contract-invitation'": JSON.stringify(invitationUrl),
      "'../../lib/session-duration'": JSON.stringify(durationUrl),
      "'../../lib/contract-presentation'": JSON.stringify(presentationUrl),
    })
  );
  state.status = 'pending';
  for (const conf of ['0', '1']) {
    const token = await createContractToken(42, '0501234567', conf, invitationId, Date.now() + 86400000, 'ru');
    const response = await GET({
      request: new Request(
        `https://example.test/api/get_price?token=${token}&locale=he&conf=${conf === '1' ? '0' : '1'}`
      ),
    });
    const data = await response.json();
    assert.equal(data.locale, 'ru');
    assert.equal(data.contract_version, '1');
    assert.equal(data.duration_label, 'От одного до двух часов');
    assert.equal(
      data.template,
      conf === '1' ? '/contract_template_ru_fillable.pdf' : '/contract_template_conf_ru_fillable.pdf'
    );
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
});

await test('real Russian PDFs fill and flatten through the submission handler, with mocked delivery and database', async () => {
  const require = createRequire(import.meta.url);
  const actual = await loadSource('src/pages/api/submit_contract.ts', {
    "'../../lib/contract-token'": JSON.stringify(contractUrl),
    "'../../lib/contract-invitation'": JSON.stringify(invitationUrl),
    "'../../lib/session-duration'": JSON.stringify(durationUrl),
    "'../../lib/contract-presentation'": JSON.stringify(presentationUrl),
    "'../../lib/contract-email'": JSON.stringify(emailUrl),
    "'../../lib/db.ts'": JSON.stringify(mockUrl),
    "'@pdf-lib/fontkit'": JSON.stringify(pathToFileURL(require.resolve('@pdf-lib/fontkit')).href),
    "'pdf-lib'": JSON.stringify(pathToFileURL(require.resolve('pdf-lib')).href),
    "'resend'": JSON.stringify(mockUrl),
    'import.meta.env.RESEND_API_KEY': "'test-key'",
  });
  const { POST: submit } = await import(actual);
  const { PDFDocument, PDFName } = await import('pdf-lib');
  const fetchBefore = globalThis.fetch;
  const assets = [];
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    assert.ok(
      [
        '/contract_template_ru_fillable.pdf',
        '/contract_template_conf_ru_fillable.pdf',
        '/fonts/Rubik-Regular.ttf',
      ].includes(path)
    );
    assets.push(path);
    return new Response(await readFile(new URL(`../public${path}`, import.meta.url)));
  };
  try {
    await mkdir(new URL('../tmp/pdfs/', import.meta.url), { recursive: true });
    for (const conf of ['0', '1']) {
      state.status = 'pending';
      state.mailError = false;
      state.failCommit = false;
      const token = await createContractToken(42, '0501234567', conf, invitationId, Date.now() + 86400000, 'ru');
      const form = new FormData();
      for (const [key, value] of Object.entries({
        token,
        name: 'Анна Александровна Иванова',
        email: 'test@example.test',
        id: '123456789',
        address: 'ул. Герцля, 25, квартира 12, Холон',
        locale: 'he',
        contractVersion: '999',
        conf: conf === '1' ? '0' : '1',
        price: '1',
        signature: `data:image/png;base64,${(await readFile(new URL('../public/email/logo.png', import.meta.url))).toString('base64')}`,
      }))
        form.set(key, value);
      const response = await submit({
        request: new Request('https://example.test/api/submit_contract', { method: 'POST', body: form }),
        url: new URL('https://example.test/api/submit_contract'),
        redirect: (url, status) => new Response(null, { status, headers: { Location: url } }),
      });
      assert.equal(response.status, 303);
      assert.equal(response.headers.get('Location'), '/ru/thank_you');
      assert.equal(state.status, 'signed');
      assert.equal(state.message.subject, 'Подписанный договор на фотосъёмку');
      assert.match(state.message.html, /lang="ru" dir="ltr"/);
      assert.doesNotMatch(state.message.html, /[\u0590-\u05ff]/);
      assert.equal(state.message.attachments[0].filename, 'Договор-фотосъёмки-Юлия.pdf');
      const bytes = Buffer.from(state.message.attachments[0].content, 'base64');
      const pdf = await PDFDocument.load(bytes);
      assert.equal(pdf.getPageCount(), 2);
      assert.equal(pdf.getForm().getFields().length, 0);
      for (const page of pdf.getPages()) assert.equal(page.node.Annots()?.size() || 0, 0);
      assert.equal(pdf.getSubject(), `Photography contract ru v1; publication=${conf}`);
      assert.ok(pdf.getPages()[1].node.Resources().lookup(PDFName.of('XObject')).keys().length >= 3);
      await writeFile(new URL(`../tmp/pdfs/signed-ru-${conf}-test.pdf`, import.meta.url), bytes);
      await writeFile(new URL(`../tmp/pdfs/email-ru-test.html`, import.meta.url), state.message.html);
    }
    assert.ok(assets.includes('/contract_template_ru_fillable.pdf'));
    assert.ok(assets.includes('/contract_template_conf_ru_fillable.pdf'));
  } finally {
    globalThis.fetch = fetchBefore;
  }
});
