'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { findChapter } from '@/lib/registry';
import { getProgress } from '@/lib/storage';
import { isDue } from '@/lib/spacedRep';
import type { Chapter, Subject } from '@/lib/types';

export default function ChapterHome({ params }: { params: { subject: Subject; chapter: string } }) {
  const { subject, chapter: chapterId } = params;
  const [ch, setCh] = useState<Chapter | null>(null);
  const [stats, setStats] = useState<{ total: number; due: number; done: number }>({ total: 0, due: 0, done: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const row = findChapter(chapterId);
      if (!row) return;
      const c = await row.loader();
      if (cancelled) return;
      setCh(c);
      const prog = getProgress(chapterId);
      const cards = c.sections.flatMap(s => s.cards);
      const total = cards.length;
      const done = cards.filter(x => prog[x.id]).length;
      const due = cards.filter(x => isDue(prog[x.id])).length;
      setStats({ total, due, done });
    })();
    return () => { cancelled = true; };
  }, [chapterId]);

  if (!ch) return <div className="p-6 font-note">Loading chapter…</div>;

  return (
    <main className="min-h-screen">
      <header className="px-4 pt-5 pb-4 rounded-b-3xl text-white"
        style={{ background: 'linear-gradient(135deg,#c0392b,#8e44ad)' }}>
        <Link href={`/${subject}`} className="text-white/90 font-note text-sm">← {subject.toUpperCase()}</Link>
        <div className="mt-2">
          <div className="chip" style={{ background: 'rgba(255,255,255,0.25)', color:'#fff' }}>Ch. {ch.number}</div>
          <div className="font-head text-3xl leading-tight mt-1">{ch.title}</div>
          <div className="font-note text-sm opacity-95 mt-1">{ch.summary}</div>
          {ch.currency && (
            <div className="mt-2 bg-white/15 rounded-lg px-3 py-2 font-note text-sm">
              🆕 {ch.currency}
            </div>
          )}
        </div>
      </header>

      <section className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Cards" val={stats.total} bg="#eaf2f8" />
          <Stat label="Due today" val={stats.due} bg="#fadbd8" hot={stats.due > 0} />
          <Stat label="Reviewed" val={stats.done} bg="#d5f5e3" />
        </div>
      </section>

      <section className="px-4 mt-4 grid gap-3 pb-10">
        <ModeCard href={`/${subject}/${chapterId}/flip`}
          emoji="🎴" title="Flip Cards" hint="Active recall with spaced repetition"
          count={`${stats.due} due · ${stats.total} total`} accent="#c0392b" />
        <ModeCard href={`/${subject}/${chapterId}/practice`}
          emoji="✍️" title="Practice" hint="Type your answer, reveal, self-mark"
          count={`${ch.practice.length} questions`} accent="#27ae60" />
        <ModeCard href={`/${subject}/${chapterId}/read`}
          emoji="📖" title="Read Notes" hint="Section-by-section revision"
          count={`${ch.sections.length} sections`} accent="#2874a6" />
      </section>
    </main>
  );
}

function Stat({ label, val, bg, hot }: { label: string; val: number; bg: string; hot?: boolean }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: bg }}>
      <div className="font-head text-3xl leading-none" style={{ color: hot ? '#c0392b' : '#1a2f5c' }}>{val}</div>
      <div className="font-note text-xs opacity-80 mt-1">{label}</div>
    </div>
  );
}

function ModeCard({ href, emoji, title, hint, count, accent }:
  { href: string; emoji: string; title: string; hint: string; count: string; accent: string }) {
  return (
    <Link href={href} className="paper block rounded-2xl shadow-md active:scale-[0.99] transition-transform">
      <div className="paper-inner">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{emoji}</div>
          <div className="flex-1">
            <div className="font-head text-2xl leading-none" style={{ color: accent }}>{title}</div>
            <div className="font-note text-sm opacity-80 mt-0.5">{hint}</div>
          </div>
          <div className="text-right">
            <div className="font-note text-[11px] opacity-70">{count}</div>
            <div className="text-2xl" style={{ color: accent }}>→</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
