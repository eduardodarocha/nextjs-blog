// OG card generator — reproduces the 1200x630 social images committed in
// 076a077 so posts added after that (the cron pipeline never made them) can
// have a unique og:image / twitter:image instead of falling back to the
// generic default.
//
// Usage:
//   node scripts/generate-og-image.js <slug>            one post
//   node scripts/generate-og-image.js --all-missing     every post lacking an image
//   node scripts/generate-og-image.js <slug> --force    overwrite an existing image
//
// Output: public/images/og/<slug>.png  (add `coverImage: '/images/og/<slug>.png'`
// to the post's frontmatter — pages/posts/[id].js turns that into og:image).

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'og');
const PROFILE = path.join(ROOT, 'public', 'images', 'profile.png');

const W = 1200;
const H = 630;

const C = {
  bg: '#09090B',
  grid: '#FFFFFF',
  white: '#FAFAFA',
  cyan: '#38BDF8',
  indigo: '#6366F1',
  green: '#22C55E',
  muted: '#5B5B66',
};

const DISPLAY = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Consolas', 'DejaVu Sans Mono', 'Courier New', monospace";

// Mirror of deriveCategory in lib/posts.js so the badge here matches the one
// the site renders for the same post.
function deriveCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes('agent') || text.includes('autônomo') || text.includes('autonomous')) {
    return 'autonomous_agents';
  }
  if (text.includes('llm') || text.includes('prompt') || text.includes('rag') || text.includes('model')) {
    return 'llm_ops';
  }
  if (text.includes('ssr') || text.includes('static') || text.includes('next') || text.includes('render')) {
    return 'web_architecture';
  }
  return 'ai_engineering';
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Greedy word-wrap with an approximate advance width (no font metrics available
// to librsvg at build time). Caps at `maxLines`, ellipsising the last line.
function wrapTitle(text, { fontSize, maxWidth, maxLines }) {
  const charW = fontSize * 0.52;
  const perLine = Math.max(1, Math.floor(maxWidth / charW));
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= perLine || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);

  if (lines.length === maxLines) {
    // Did everything fit? If not, ellipsise the final line.
    const consumed = lines.join(' ').split(/\s+/).length;
    if (consumed < words.length || lines[maxLines - 1].length > perLine) {
      let last = lines[maxLines - 1];
      while (last.length > perLine - 1 && last.includes(' ')) {
        last = last.slice(0, last.lastIndexOf(' '));
      }
      lines[maxLines - 1] = `${last}…`;
    }
  }
  return lines;
}

function gridLines() {
  const step = 150;
  const parts = [];
  for (let x = 30; x < W; x += step) {
    parts.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.grid}" stroke-opacity="0.04" stroke-width="1"/>`);
  }
  for (let y = 30; y < H; y += step) {
    parts.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.grid}" stroke-opacity="0.04" stroke-width="1"/>`);
  }
  return parts.join('\n  ');
}

function backgroundSvg({ title, slug, categoryLabel }) {
  const titleLines = wrapTitle(title, { fontSize: 52, maxWidth: 740, maxLines: 3 });
  const lineHeight = 62;
  const titleTop = 150;

  const tspans = titleLines
    .map((l, i) => `<tspan x="64" y="${titleTop + i * lineHeight}">${escapeXml(l)}</tspan>`)
    .join('');

  const accentY = titleTop + (titleLines.length - 1) * lineHeight + 34;
  const urlY = accentY + 44;
  const slugY = urlY + 32;

  // Keep the slug line clear of the profile circle (~63 mono chars fit).
  const slugText = slug.length > 63 ? `${slug.slice(0, 62)}…` : slug;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  ${gridLines()}
  <circle cx="64" cy="42" r="9" fill="${C.green}"/>
  <text x="88" y="52" font-family="${DISPLAY}" font-size="30" font-weight="700" fill="${C.white}">Eduardo Rocha</text>
  <text x="1164" y="50" text-anchor="end" font-family="${MONO}" font-size="22" fill="${C.cyan}">[ ${escapeXml(categoryLabel)} ]</text>
  <rect x="1180" y="12" width="4" height="60" fill="${C.cyan}"/>
  <text font-family="${DISPLAY}" font-size="52" font-weight="700" fill="${C.white}">${tspans}</text>
  <rect x="64" y="${accentY}" width="232" height="5" fill="${C.cyan}"/>
  <text x="64" y="${urlY}" font-family="${MONO}" font-size="22" fill="${C.cyan}">www.eduardorocha.dev</text>
  <text x="64" y="${slugY}" font-family="${MONO}" font-size="20" fill="${C.muted}">// ${escapeXml(slugText)}</text>
  <circle cx="1128" cy="440" r="7" fill="${C.green}"/>
  <text x="64" y="596" font-family="${MONO}" font-size="20" fill="${C.muted}">Eduardo Rocha  •  Next.js &amp; AI Blog</text>
</svg>`);
}

function ringSvg() {
  const cx = 983;
  const cy = 293;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${C.cyan}"/>
      <stop offset="100%" stop-color="${C.indigo}"/>
    </linearGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="154" fill="none" stroke="${C.cyan}" stroke-opacity="0.15" stroke-width="12"/>
  <circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="url(#ring)" stroke-width="7"/>
</svg>`);
}

async function circularPhoto() {
  const size = 294; // r = 147, sits just inside the r=150 ring
  const base = await sharp(PROFILE).grayscale().resize(size, size, { fit: 'cover' }).png().toBuffer();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  );
  return sharp(base).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

async function generate(slug, { force = false } = {}) {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error(`no post file: posts/${slug}.md`);

  const outPath = path.join(OUT_DIR, `${slug}.png`);
  if (fs.existsSync(outPath) && !force) {
    console.log(`skip   ${slug}.png (exists — pass --force to overwrite)`);
    return outPath;
  }

  const parsed = matter(fs.readFileSync(file, 'utf8'));
  const title = parsed.data.title || slug;
  const category = parsed.data.category || deriveCategory(title, parsed.content);
  const categoryLabel = category.toUpperCase();

  const photo = await circularPhoto();
  const bg = backgroundSvg({ title, slug, categoryLabel });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  await sharp(bg)
    .composite([
      { input: photo, left: 983 - 147, top: 293 - 147 },
      { input: ringSvg(), left: 0, top: 0 },
    ])
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(outPath);

  console.log(`wrote  images/og/${slug}.png  [${categoryLabel}]  "${title.slice(0, 60)}${title.length > 60 ? '…' : ''}"`);
  return outPath;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const positional = args.filter((a) => !a.startsWith('--'));

  let slugs;
  if (args.includes('--all-missing')) {
    slugs = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
      .filter((s) => force || !fs.existsSync(path.join(OUT_DIR, `${s}.png`)));
  } else if (positional.length) {
    slugs = positional;
  } else {
    console.error('usage: node scripts/generate-og-image.js <slug> | --all-missing [--force]');
    process.exit(1);
  }

  if (!slugs.length) {
    console.log('nothing to do — every post already has an OG image');
    return;
  }

  for (const slug of slugs) {
    await generate(slug, { force });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
