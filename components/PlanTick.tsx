'use client';
import { useEffect, useState } from 'react';

// "Done" tick per exercise: a per-browser convenience (localStorage), not synced.
export default function PlanTick({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  const key = 'ca-revise:v1:writeplan:' + id;
  useEffect(() => { try { setOn(localStorage.getItem(key) === '1'); } catch {} }, [key]);
  const toggle = () => { const v = !on; setOn(v); try { localStorage.setItem(key, v ? '1' : '0'); } catch {} };
  return <button type="button" className={'wp-tick' + (on ? ' wp-tick-on' : '')} aria-pressed={on} onClick={toggle}>{on ? 'Done ✓' : 'Mark done'}</button>;
}
