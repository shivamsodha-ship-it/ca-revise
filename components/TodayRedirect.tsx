'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Points the student at today's page, or the nearest day in the plan. Local date, so it needs the browser.
export default function TodayRedirect({ dates }: { dates: string[] }) {
  const [d, setD] = useState<string | null>(null);
  useEffect(() => {
    const t = new Date().toLocaleDateString('en-CA');
    setD(dates.find(x => x >= t) ?? dates[dates.length - 1]);
  }, [dates]);
  if (!d) return null;
  return <p><Link className="btn primary" href={`/write-plan/${d}`}>Open {d === new Date().toLocaleDateString('en-CA') ? 'today' : d} →</Link></p>;
}
