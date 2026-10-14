import Link from 'next/link';
import Board from '@/components/Board';
import { seedChapters } from '@/lib/registry';

export const metadata = { title: 'Syllabus board · CA Revise' };

export default function BoardPage() {
  return (
    <>
      <header className="topbar"><div className="topbar-in">
        <Link href="/" className="brand"><span className="seal">CA</span><span className="brand-t">CA Revise</span></Link>
        <span className="crumb-sep" aria-hidden="true">/</span>
        <span className="chapter-name">Syllabus board</span>
      </div></header>
      <main className="page">
        <header className="vhead">
          <p className="eyebrow">Group 1 · November 2026</p>
          <h1 className="vh">Syllabus board</h1>
          <p className="muted">Every chapter of FR, AFM and AAA with where you stand. Move a chapter along after each block; skip the ones ICAI asks least. The bar is how ready each paper is against the target line.</p>
        </header>
        <Board seed={seedChapters()} />
      </main>
    </>
  );
}
