import { Suspense } from 'react';
import FlashcardFolderRoute from '../folder-route';

export default function FlashcardFolderDeckPage() {
  return <Suspense fallback={<main className="shell"><section className="auth-loading"><span className="mark">N</span><p>Opening your folder deck…</p></section></main>}><FlashcardFolderRoute study /></Suspense>;
}
