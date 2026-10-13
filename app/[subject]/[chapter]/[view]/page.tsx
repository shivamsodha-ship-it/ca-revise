import { notFound } from 'next/navigation';
import { listChapters } from '@/lib/registry';
import ViewSwitch from '@/components/ViewSwitch';

const VIEWS = ['vision', 'path', 'compare', 'connect', 'memory', 'solve', 'games', 'drill', 'hunt', 'mcq', 'library', 'cheat', 'formulas', 'notes', 'read', 'flip', 'practice'];

export const dynamicParams = false;
export function generateStaticParams() {
  return listChapters().flatMap(r => VIEWS.map(view => ({ subject: r.subject, chapter: r.id, view })));
}

export default function ViewPage({ params }: { params: { view: string } }) {
  if (!VIEWS.includes(params.view)) notFound();
  return <ViewSwitch view={params.view} />;
}
