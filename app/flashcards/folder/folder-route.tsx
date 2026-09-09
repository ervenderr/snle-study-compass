'use client';

import { useSearchParams } from 'next/navigation';
import StudyCompass from '../../page';

export default function FlashcardFolderRoute({ study = false }: { study?: boolean }) {
  const folderId = useSearchParams().get('folder') || undefined;
  return <StudyCompass initialView={study ? 'flashcardStudy' : 'flashcardFolder'} initialFlashcardMode="custom" initialFlashcardFolderId={folderId} />;
}
