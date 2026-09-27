'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { listChapters, allSubjects } from '@/lib/registry';
import type { Subject } from '@/lib/types';

const labels: Record<Subject, { label: string; long: string; emoji: string }> = {
  aaa: { label: 'AAA', long: 'Advanced Auditing, Assurance & Professional Ethics', emoji: '⚖️' },
  fr:  { label: 'FR',  long: 'Financial Reporting', emoji: '📈' },
  afm: { label: 'AFM', long: 'Advanced Financial Management', emoji: '💹' },
};

export default function SubjectPage({ params }: { params: { subject: Subject } }) {
  const subject = params.subject;
  const chapters = useMemo(() => listChapters(subject), [subject]);
  const meta = labels[subject];
  if (!meta) return <div className="p-4">Unknown subject.</div>;

  return (
    <main className="min-h-screen">
      <header className="px-4 pt-5 pb-4 rounded-b-3xl text-white"
        style={{ background: 'linear-gradient(135deg,#2874a6,#8e44ad)' }}>
        <Link href="/" className="text-white/90 font-note text-sm">← Home</Link>
        <div className="flex items-center gap-3 mt-2">
          <div className="text-4xl">{meta.emoji}</div>
          <div>
            <div className="font-head text-3xl leading-none">{meta.label}</div>
            <div className="font-note text-sm opacity-95">{meta.long}</div>
          </div>
        </div>
      </header>

      <section className="px-4 mt-4 pb-10">
        <div className="font-head text-xl text-accent mb-2">Chapters</div>
        {chapters.length === 0 && (
          <div className="paper rounded-2xl shadow">
            <div className="paper-inner">
              <div className="font-head text-lg text-accent">No chapters yet</div>
              <div className="text-sm mt-1">Add a chapter JSON at <code className="bg-gray-100 px-1 rounded">data/{subject}/</code> and register it in <code className="bg-gray-100 px-1 rounded">lib/registry.ts</code>.</div>
            </div>
          </div>
        )}
        <div className="grid gap-3">
          {chapters.map(c => (
            <Link key={c.id} href={`/${subject}/${c.id}`}
              className="paper block rounded-2xl shadow-md active:scale-[0.99] transition-transform">
              <div className="paper-inner">
                <div className="flex items-center gap-2">
                  <div className="chip" style={{ background:'#c0392b', color:'#fff' }}>Ch. {c.number}</div>
                  <div className="font-head text-2xl text-accent leading-none">{c.title}</div>
                </div>
                <div className="font-note text-sm opacity-80 mt-1">{c.summary}</div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="chip" style={{ background:'#fff59d', color:'#7d6608' }}>Flip cards</span>
                  <span className="chip" style={{ background:'#d5f5e3', color:'#196f3d' }}>Practice</span>
                  <span className="chip" style={{ background:'#eaf2f8', color:'#1a5490' }}>Read notes</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
