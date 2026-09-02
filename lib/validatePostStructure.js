// Guards against the failure mode where the model (usually the editor pass,
// occasionally the generator) returns an article body with its Markdown
// structure collapsed onto a single line — no blank lines between blocks, so
// remark renders the whole post as one giant heading. See the guerra-fria
// incident. Used by editorAgent (fall back to the pre-edit draft) and by
// publishPostAsPR (hard stop before a broken body is ever committed).

const MIN_LINES = 5;
const MIN_HEADINGS = 2;

// A well-formed post body has: real line breaks, a blank line somewhere
// (paragraph separation), and at least a couple of `##`/`###` section
// headings on their own line. A one-line blob fails all three.
export function validatePostStructure(body) {
  if (typeof body !== 'string' || body.trim() === '') {
    return { ok: false, reason: 'empty body' };
  }

  const lines = body.replace(/\r\n/g, '\n').split('\n');
  if (lines.length < MIN_LINES) {
    return { ok: false, reason: `only ${lines.length} line(s); expected at least ${MIN_LINES}` };
  }

  if (!/\n[ \t]*\n/.test(body.replace(/\r\n/g, '\n'))) {
    return { ok: false, reason: 'no blank line between blocks (body is likely one run-on line)' };
  }

  const headings = lines.filter((l) => /^#{1,3}\s+\S/.test(l)).length;
  if (headings < MIN_HEADINGS) {
    return { ok: false, reason: `${headings} block heading(s); expected at least ${MIN_HEADINGS}` };
  }

  // A single heading line that also carries hundreds of words is the
  // signature of collapsed structure even when the counts above pass.
  const longestLine = lines.reduce((max, l) => Math.max(max, l.trim().split(/\s+/).length), 0);
  if (longestLine > 250) {
    return { ok: false, reason: `longest line has ${longestLine} words; structure likely collapsed` };
  }

  return { ok: true };
}
