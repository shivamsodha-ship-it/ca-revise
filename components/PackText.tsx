// ICAI text exactly as extracted. The PDF hard-wraps lines, so prose is re-flowed (whitespace only, no word changes);
// paragraphs that are really tables keep their columns and scroll sideways inside the block.
const ITEM = /^\s*(\(?[ivx]{1,5}\)|\(?[a-zA-Z]\)|\d{1,2}[.)]|[•❖●\-–])\s/;
const BULLET = /^\s*[•❖●\-–]\s/;

// A table has rows split into columns by wide gaps: three or more cells, or a label with a figure in at least three rows.
// Justified prose and bulleted text have wide gaps too, but their cells are words, not figures.
function isTable(p: string): boolean {
  let wide = 0, figures = 0;
  for (const l of p.split('\n')) {
    const cells = l.trim().split(/ {3,}/).filter(Boolean);
    if (cells.length >= 3 && cells.slice(1).some(c => /[\d₹]/.test(c))) wide++;
    else if (cells.length === 2 && /^[\d₹(\-–.,%\s)]+$/.test(cells[1])) figures++;
  }
  return wide >= 2 || figures >= 3;
}

interface Line { t: string; item: boolean }
function reflow(p: string): Line[] {
  const out: Line[] = [];
  for (const ln of p.split('\n')) {
    const t = ln.trim().replace(/ {2,}/g, ' ');
    if (!t) continue;
    const prev = out[out.length - 1];
    const isItem = BULLET.test(ln);
    if (prev && !ITEM.test(ln) && (!/[:.?]$/.test(prev.t) || prev.t.length > 60)) prev.t += ' ' + t;
    else out.push({ t, item: isItem });
  }
  return out;
}

export default function PackText({ text }: { text: string }) {
  const paras = text.split(/\n{2,}/);
  return (
    <div className="pk-text">
      {paras.map((p, i) => {
        if (isTable(p)) return <pre key={i} className="pk-pre pk-table">{p}</pre>;
        return <div key={i} className="pk-prose">{reflow(p).map((l, j) => <p key={j} className={l.item ? 'pk-li' : undefined}>{l.t}</p>)}</div>;
      })}
    </div>
  );
}
