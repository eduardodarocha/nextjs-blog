// Unit checks for buildPageTitle — the <title> builder. Guards against the
// doubled-brand homepage title ("… Software Developer | Eduardo Rocha") and
// keeps article titles from running long.
// Run: npm run test:title
const assert = require('assert');
const { buildPageTitle, siteTitle } = require('../lib/siteMeta');

let passed = 0;
const check = (name, fn) => { fn(); passed += 1; console.log(`  ok  ${name}`); };

check('home ignores title/seoTitle and never gets a suffix', () => {
  assert.strictEqual(buildPageTitle({ home: true }), siteTitle);
  assert.strictEqual(
    buildPageTitle({ home: true, title: 'Whatever', seoTitle: 'Whatever' }),
    siteTitle
  );
  assert.ok(!buildPageTitle({ home: true }).includes('| Eduardo Rocha'));
});

check('short seoTitle gets the brand suffix', () => {
  assert.strictEqual(
    buildPageTitle({ seoTitle: 'IA na Borda (Edge AI) e TinyML em 2026' }),
    'IA na Borda (Edge AI) e TinyML em 2026 | Eduardo Rocha'
  );
});

check('long seoTitle is used bare (no suffix)', () => {
  const s = 'IA no Desenvolvimento de Software: Ferramentas e Mudanças'; // 55 chars
  assert.strictEqual(buildPageTitle({ seoTitle: s }), s);
});

check('seoTitle wins over the on-page title', () => {
  assert.strictEqual(
    buildPageTitle({ seoTitle: 'Curto', title: 'Um Título Muito Mais Longo Que Não Deveria Ir Para a Tag Title' }),
    'Curto | Eduardo Rocha'
  );
});

check('falls back to the long H1 title when no seoTitle', () => {
  const long = 'A Guerra Fria da IA Generativa: Modelos Mais Acessíveis, Especializados e o Brasil';
  assert.strictEqual(buildPageTitle({ title: long }), long);
});

check('no title and no seoTitle falls back to siteTitle, not doubled', () => {
  assert.strictEqual(buildPageTitle({}), siteTitle);
  assert.strictEqual(buildPageTitle(), siteTitle);
  assert.ok(!buildPageTitle({}).includes('| Eduardo Rocha'));
});

check('every title stays within a sane length', () => {
  const samples = [
    buildPageTitle({ home: true }),
    buildPageTitle({ seoTitle: 'SLMs: A Ascensão dos Modelos de Linguagem Pequenos' }),
    buildPageTitle({ seoTitle: 'Regulação de IA: AI Act, PL 2338 e o Impacto no Código' }),
  ];
  for (const s of samples) assert.ok(s.length <= 70, `too long (${s.length}): ${s}`);
});

console.log(`\n${passed} checks passed`);
