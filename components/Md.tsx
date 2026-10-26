import type { ReactNode } from 'react';

// Small markdown renderer for the analysis files: headings, paragraphs, bullet and numbered lists, tables, **bold**, *em*, `code`.
function inline(s: string, k = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const t = m[0];
    out.push(t.startsWith('**') ? <strong key={k + '-' + i}>{t.slice(2, -2)}</strong> : t.startsWith('`') ? <code key={k + '-' + i}>{t.slice(1, -1)}</code> : <em key={k + '-' + i}>{t.slice(1, -1)}</em>);
    last = m.index + t.length; i++;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
const cells = (ln: string) => ln.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

export default function Md({ text }: { text: string }) {
  const lines = text.split('\n');
  const nodes: ReactNode[] = [];
  let i = 0, key = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (!ln.trim()) { i++; continue; }
    const h = ln.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const L = h[1].length;
      nodes.push(L === 1 ? <h2 key={key++} className="md-h1">{inline(h[2])}</h2> : L === 2 ? <h2 key={key++} className="md-h2">{inline(h[2])}</h2> : <h3 key={key++} className="md-h3">{inline(h[2])}</h3>);
      i++; continue;
    }
    if (ln.trim().startsWith('|') && lines[i + 1]?.match(/^\s*\|[\s:|-]+\|\s*$/)) {
      const head = cells(ln); i += 2; const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(cells(lines[i])); i++; }
      nodes.push(
        <div key={key++} className="md-tw"><table className="md-t"><thead><tr>{head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
          <tbody>{rows.map((r, a) => <tr key={a}>{r.map((c, b) => <td key={b}>{inline(c)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(ln)) {
      const ordered = /^\s*\d+\./.test(ln); const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '')); i++; }
      const li = items.map((t, j) => <li key={j}>{inline(t)}</li>);
      nodes.push(ordered ? <ol key={key++} className="md-l">{li}</ol> : <ul key={key++} className="md-l">{li}</ul>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\s*\||\s*([-*]|\d+\.)\s+)/.test(lines[i])) { para.push(lines[i].trim()); i++; }
    nodes.push(<p key={key++} className="md-p">{inline(para.join(' '))}</p>);
  }
  return <div className="md">{nodes}</div>;
}
