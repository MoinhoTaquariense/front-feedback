const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = fs.readFileSync(require.resolve('../app/api/auth/login/route.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const route = {};
new Function('require', 'exports', compiled)(require, route);
const request = body => new Request('http://localhost/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('login forwards valid credentials and returns the authenticated session', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.ok(url.endsWith('/api/auth/login'));
    assert.deepEqual(JSON.parse(options.body), { email: 'test@example.invalid', senha: 'test-password' });
    return Response.json({ success: true, data: { token: 'test-session' } });
  });
  const result = await route.POST(request({ email: ' test@example.invalid ', senha: 'test-password' }));
  assert.equal(result.status, 200);
  assert.equal((await result.json()).data.token, 'test-session');
  assert.equal(upstream.mock.callCount(), 1);
});

test('login preserves invalid-credential status instead of returning 500', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ message: 'Credenciais inválidas' }, { status: 401 }));
  const result = await route.POST(request({ email: 'test@example.invalid', senha: 'invalid-password' }));
  assert.equal(result.status, 401);
  assert.equal((await result.json()).message, 'Credenciais inválidas');
});

test('network failure produces a service-unavailable response', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('fetch failed'); });
  t.mock.method(console, 'error', () => {});
  const result = await route.POST(request({ email: 'test@example.invalid', senha: 'test-password' }));
  assert.equal(result.status, 503);
  assert.match((await result.json()).message, /temporariamente indisponível/);
});

test('invalid login bodies are rejected before contacting the backend', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected upstream request'); });
  for (const body of [null, {}, { email: 123, senha: 'test-password' }, { email: 'test@example.invalid', senha: '' }]) {
    assert.equal((await route.POST(request(body))).status, 400);
  }
  assert.equal((await route.POST(new Request('http://localhost/api/auth/login', { method: 'POST', body: '{' }))).status, 400);
  assert.equal(upstream.mock.callCount(), 0);
});
