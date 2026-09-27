import ChapterShell from '@/components/ChapterShell';
import type { Subject } from '@/lib/types';

export default function ChapterLayout({ params, children }: { params: { subject: Subject; chapter: string }; children: React.ReactNode }) {
  return <ChapterShell subject={params.subject} chapterId={params.chapter}>{children}</ChapterShell>;
}
