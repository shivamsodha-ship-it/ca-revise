import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormulaBank, { formulaLabels } from '@/components/FormulaBank';
import { SUBJECTS, listChapters, subjectOf } from '@/lib/registry';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.id }));
}
export async function generateMetadata({ params }: { params: { subject: string } }) {
  return { title: `${subjectOf(params.subject)?.label ?? ''} formula bank · CA Revise` };
}

// Every chapter's formula families for one subject, in chapter order.
export default async function SubjectFormulas({ params }: { params: { subject: string } }) {
  const s = subjectOf(params.subject);
  if (!s) notFound();
  const rows = (await Promise.all(listChapters(s.id).map(async r => ({ r, cb: r.casebook ? await r.casebook() : null }))))
    .filter(x => x.cb?.formulas?.length);
  const total = rows.reduce((k, { cb }) => k + cb!.formulas!.reduce((m, f) => m + 1 + f.items.length, 0), 0);
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <Link href={`/${s.id}`} className="crumb">{s.label}</Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <span className="chapter-name">Formula bank</span>
      </div></header>
      <main className="page">
        <header className="vhead">
          <p className="eyebrow">{s.long}</p>
          <h1 className="vh">Formula bank</h1>
          <p className="muted">{rows.length ? `${total} formulas across ${rows.length} chapter${rows.length > 1 ? 's' : ''}. Each family starts from one master formula.` : 'No chapter has a formula bank yet.'}</p>
        </header>
        {rows.length > 1 && <nav className="fjump" aria-label="Chapters">{rows.map(({ r }) => <a key={r.id} href={`#${r.id}`} className="chip">Ch {r.number} {r.title}</a>)}</nav>}
        {rows.map(({ r, cb }) => (
          <section key={r.id} id={r.id} className="fchap">
            <div className="sec-h"><h2>Ch {r.number} · {r.title}</h2><Link href={`/${s.id}/${r.id}/formulas`} className="muted">Open in chapter →</Link></div>
            <FormulaBank families={cb!.formulas!} labels={formulaLabels(cb!.formulas!, cb!.P)} />
          </section>
        ))}
      </main>
    </>
  );
}
