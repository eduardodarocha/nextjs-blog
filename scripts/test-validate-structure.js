// Unit checks for lib/validatePostStructure — the guard that stopped the
// guerra-fria "whole article inside one <h1>" incident from recurring.
// Run: npm run test:validate
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validatePostStructure } = require('../lib/validatePostStructure');

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

// A structurally sound post from the repo passes.
check('well-formed post body passes', () => {
  const raw = fs.readFileSync(
    path.join(__dirname, '..', 'posts', 'ia-saude-diagnostico-clinico-inteligente.md'),
    'utf8'
  );
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const res = validatePostStructure(body);
  assert.strictEqual(res.ok, true, `expected ok, got ${JSON.stringify(res)}`);
});

// The exact failure shape from the incident: headings, lists and paragraphs
// all concatenated onto a single line.
check('collapsed one-line body fails', () => {
  const body =
    '# A Guerra Fria da IA GenerativaO ecossistema da IA vive um momento de efervescência. ' +
    'Grandes players lançam modelos.## Acelerando a InovaçãoO mercado tem assistido a uma explosão. ' +
    'A competição impulsionou lançamentos.## O Brasil Acelera sua EstratégiaEm meio a essa dinâmica, ' +
    'o Brasil avançou.### Um SupercomputadorUm dos pilares envolve a expansão da capacidade. ' +
    'Locais como a UFRN já sediam centros.## ConclusãoA corrida pelo silício é uma transformação.';
  const res = validatePostStructure(body);
  assert.strictEqual(res.ok, false, 'expected failure for one-line body');
});

check('empty body fails', () => {
  assert.strictEqual(validatePostStructure('').ok, false);
  assert.strictEqual(validatePostStructure('   \n  ').ok, false);
});

check('too few lines fails', () => {
  const res = validatePostStructure('# Title\n\nOne short paragraph and nothing else.');
  assert.strictEqual(res.ok, false);
});

check('only one heading fails', () => {
  const body = [
    '# Title',
    '',
    'First paragraph with enough words to look real and span a sentence.',
    '',
    'Second paragraph, still no section headings anywhere in the body text.',
    '',
    'Third paragraph closing it out without ever adding a level-two heading.',
  ].join('\n');
  const res = validatePostStructure(body);
  assert.strictEqual(res.ok, false);
});

check('multi-line but no blank lines fails', () => {
  const body = [
    '# Title',
    'First paragraph glued straight to the next block with only a newline.',
    '## Section One',
    'Body text for section one that never gets a blank line before it.',
    '## Section Two',
    'Body text for section two, same problem, newline-only separation.',
  ].join('\n');
  const res = validatePostStructure(body);
  assert.strictEqual(res.ok, false);
});

check('well-formed synthetic body passes', () => {
  const body = [
    '# Title',
    '',
    'Intro paragraph with a reasonable number of words to read as real prose.',
    '',
    '## Section One',
    '',
    'Section one body paragraph, properly separated by blank lines above and below.',
    '',
    '## Section Two',
    '',
    'Section two body paragraph, also properly separated.',
  ].join('\n');
  const res = validatePostStructure(body);
  assert.strictEqual(res.ok, true, JSON.stringify(res));
});

console.log(`\n${passed} checks passed`);
