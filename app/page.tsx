'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { allSubjects } from '@/lib/registry';
import { readStreak, tickStreak } from '@/lib/storage';

export default function Home() {
  const subjects = allSubjects();
  const [streak, setStreak] = useState<{ streak: number; last: string }>({ streak: 0, last: '' });
  useEffect(() => { setStreak(tickStreak()); }, []);

  return (
    <main className="min-h-screen">
      <header className="px-4 pt-6 pb-4 rounded-b-3xl text-white"
        style={{ background: 'linear-gradient(135deg,#c0392b,#8e44ad)' }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="font-head text-3xl leading-none">CA Revise</div>
            <div className="font-note text-lg opacity-90 mt-1">Active recall for Nov 2026 · hi Ss 👋</div>
          </div>
          <div className="bg-white/20 rounded-2xl px-3 py-2 text-right">
            <div className="font-head text-2xl leading-none">🔥 {streak.streak}</div>
            <div className="font-note text-xs opacity-90">day streak</div>
          </div>
        </div>
      </header>

      <section className="px-4 mt-4">
        <div className="font-head text-2xl text-accent mb-2">Pick a subject</div>
        <div className="grid gap-3">
          {subjects.map(s => (
            <Link key={s.id} href={`/${s.id}`}
              className="paper block rounded-2xl shadow-md active:scale-[0.99] transition-transform">
              <div className="paper-inner flex items-center gap-3">
                <div className="text-3xl">{s.emoji}</div>
                <div className="flex-1">
                  <div className="font-head text-2xl text-accent leading-none">{s.label}</div>
                  <div className="font-note text-sm opacity-80 mt-0.5">{s.long}</div>
                </div>
                <div className="text-right">
                  <div className="font-head text-lg text-ink">{s.count}</div>
                  <div className="font-note text-[10px] opacity-70">chapter{s.count === 1 ? '' : 's'}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5 mb-8">
        <div className="rounded-2xl bg-white p-4 border-2 border-dashed border-yellow-500 shadow-sm">
          <div className="font-head text-xl text-yellow-700">💡 Why this works</div>
          <p className="text-sm leading-5 mt-1">
            Reading a chapter three times ≠ knowing it. This app forces
            <span className="hl-y font-semibold"> retrieval </span>
            (flip cards) and
            <span className="hl-p font-semibold"> production </span>
            (typed answers) — the two things the exam actually tests.
            The <span className="hl-g font-semibold">spaced-repetition scheduler</span> brings weak cards
            back before you forget them.
          </p>
        </div>
      </section>
    </main>
  );
}
