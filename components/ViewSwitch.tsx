'use client';
import Link from 'next/link';
import { useChapter } from '@/components/ChapterShell';
import DrillView from '@/components/views/DrillView';
import HuntView from '@/components/views/HuntView';
import McqView from '@/components/views/McqView';
import LibraryView from '@/components/views/LibraryView';
import CheatView from '@/components/views/CheatView';
import FormulaView from '@/components/views/FormulaView';
import NotesView from '@/components/views/NotesView';
import FlipView from '@/components/views/FlipView';
import PracticeView from '@/components/views/PracticeView';

const CASEBOOK: Record<string, () => JSX.Element | null> = { drill: DrillView, hunt: HuntView, mcq: McqView, library: LibraryView, cheat: CheatView, formulas: FormulaView };
const CORE: Record<string, () => JSX.Element | null> = { notes: NotesView, read: NotesView, flip: FlipView, practice: PracticeView };

export default function ViewSwitch({ view }: { view: string }) {
  const { cb, base } = useChapter();
  const V = CORE[view] ?? (cb ? CASEBOOK[view] : undefined);
  if (!V) return (
    <div className="empty">
      <h1>Not in this chapter yet</h1>
      <p>This chapter has notes, flip cards and written practice. Case drills and the law library appear once its casebook file is added.</p>
      <Link className="btn primary" href={base}>Back to chapter overview</Link>
    </div>
  );
  return <V />;
}
