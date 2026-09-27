'use client';
import Link from 'next/link';
import { useChapter } from '@/components/ChapterShell';
import DrillView from '@/components/views/DrillView';
import HuntView from '@/components/views/HuntView';
import McqView from '@/components/views/McqView';
import LibraryView from '@/components/views/LibraryView';
import CheatView from '@/components/views/CheatView';
import NotesView from '@/components/views/NotesView';
import FlipView from '@/components/views/FlipView';
import PracticeView from '@/components/views/PracticeView';

const CASEBOOK_VIEWS: Record<string, () => JSX.Element | null> = {
  drill: DrillView, hunt: HuntView, mcq: McqView, library: LibraryView, cheat: CheatView,
};
const CORE_VIEWS: Record<string, () => JSX.Element | null> = {
  notes: NotesView, read: NotesView, flip: FlipView, practice: PracticeView,
};

export default function ViewPage({ params }: { params: { view: string } }) {
  const { cb, base } = useChapter();
  const V = CORE_VIEWS[params.view] ?? (cb ? CASEBOOK_VIEWS[params.view] : undefined);
  if (!V) return <div className="card empty">This chapter has no “{params.view}” section. <Link href={base}>Back to chapter</Link></div>;
  return <V />;
}
