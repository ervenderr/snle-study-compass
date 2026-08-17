'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { domainReferences, domainsForTrack, questions, snleQuestionSets, type LibraryDomain, type Question, type SnleQuestionSetId } from '../lib/questions';
import { studyResources, type StudyTrack } from '../lib/resources';

type View = 'landing' | 'home' | 'practiceSetup' | 'snleSetSetup' | 'study' | 'flashcards' | 'flashcardStudy' | 'rewards' | 'resources' | 'account';
type Mode = 'Random topics' | 'Fresh in selection' | 'All scenario forms' | 'Review incorrect' | 'Weak spots rescue';
type Confidence = 'confident' | 'unsure' | 'guessed';
type StudyRecord = { correct: boolean; selected: number; answeredAt: string; alternate: boolean; confidence?: Confidence };
type Progress = Record<string, StudyRecord>;
type SavedSession = { current: Question; track: StudyTrack; questionSet?: SnleQuestionSetId; domain: LibraryDomain | 'All domains'; topic: string; mode: Mode; selected: number | null; revealed: boolean; savedAt: string };
type Player = { xp: number; streak: number; bestStreak: number; correct: number; unlocked: string[]; updatedAt: string };
type Players = Record<StudyTrack, Player>;
type CustomFlashcard = { id: string; track: StudyTrack; front: string; back: string; createdAt: string; dueAt: string; intervalDays: number; reviewCount: number; updatedAt: string };
type AccountUser = { id: string; name: string; email: string };
type CloudSnapshot = { flashcards: CustomFlashcard[]; progress: Progress; players: Players; savedSession: SavedSession | null };
type Celebration = { title: string; message: string; emoji: string } | null;
type PepTalk = { title: string; message: string; emoji: string } | null;

const storageKey = 'snle-study-compass-progress-v2';
const sessionKey = 'snle-study-compass-session-v1';
const playerKey = 'snle-study-compass-player-v1';
const pepTalkKey = 'nurse-quest-pep-talk-v1';
const customFlashcardsKey = 'nurse-quest-custom-flashcards-v1';
const deletedFlashcardsKey = 'nurse-quest-deleted-flashcards-v1';
const letters = ['A', 'B', 'C', 'D'];
const rewards = [
  { id: 'spark', threshold: 1, emoji: '⭐', title: 'First Spark', message: 'One correct answer is a real beginning.' },
  { id: 'steady', threshold: 10, emoji: '🌱', title: 'Steady Starter', message: 'Ten correct answers—your habits are growing.' },
  { id: 'bright', threshold: 25, emoji: '✨', title: 'Bright Mind', message: 'Twenty-five clinical wins unlocked.' },
  { id: 'charger', threshold: 50, emoji: '⚡', title: 'Care Charger', message: 'Fifty correct answers—your revision energy is showing.' },
  { id: 'legend', threshold: 100, emoji: '🏆', title: 'Study Legend', message: 'One hundred correct answers. That is serious momentum.' },
];
const emptyPlayer = (): Player => ({ xp: 0, streak: 0, bestStreak: 0, correct: 0, unlocked: [], updatedAt: new Date(0).toISOString() });
const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function loadProgress(): Progress { try { return JSON.parse(window.localStorage.getItem(storageKey) || '{}') as Progress; } catch { return {}; } }
function loadSession(): SavedSession | null {
  try {
    const saved = JSON.parse(window.localStorage.getItem(sessionKey) || 'null') as Partial<SavedSession> | null;
    if (!saved?.current?.choices || saved.current.choices.length !== 4 || typeof saved.current.stem !== 'string') return null;
    return { ...saved, track: saved.track === 'PNLE' || saved.track === 'USRN' ? saved.track : 'SNLE', questionSet: saved.questionSet || 'nurse-quest-originals', domain: saved.domain || 'All domains' } as SavedSession;
  } catch { return null; }
}
function loadPlayers(): Players {
  try {
    const saved = JSON.parse(window.localStorage.getItem(playerKey) || 'null') as Partial<Players & Player> | null;
    const withTimestamp = (player: Partial<Player> | null | undefined): Player => ({ ...emptyPlayer(), ...player, updatedAt: typeof player?.updatedAt === 'string' ? player.updatedAt : new Date(0).toISOString() });
    if (saved && 'SNLE' in saved) return { SNLE: withTimestamp(saved.SNLE), PNLE: withTimestamp(saved.PNLE), USRN: withTimestamp(saved.USRN) };
    return { SNLE: withTimestamp(saved && 'xp' in saved ? saved : null), PNLE: emptyPlayer(), USRN: emptyPlayer() };
  } catch { return { SNLE: emptyPlayer(), PNLE: emptyPlayer(), USRN: emptyPlayer() }; }
}
function loadCustomFlashcards(): CustomFlashcard[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(customFlashcardsKey) || '[]') as unknown;
    if (!Array.isArray(saved)) return [];
    return saved.filter((card): card is CustomFlashcard => Boolean(card) && typeof card === 'object' &&
      typeof card.id === 'string' && (card.track === 'SNLE' || card.track === 'PNLE' || card.track === 'USRN') &&
      typeof card.front === 'string' && typeof card.back === 'string' && typeof card.createdAt === 'string' &&
      typeof card.dueAt === 'string' && typeof card.intervalDays === 'number' && Number.isFinite(card.intervalDays) &&
      typeof card.reviewCount === 'number' && Number.isFinite(card.reviewCount)).map(card => ({ ...card, updatedAt: typeof (card as Partial<CustomFlashcard>).updatedAt === 'string' ? (card as CustomFlashcard).updatedAt : card.createdAt }));
  } catch { return []; }
}
function loadDeletedFlashcards(): string[] { try { const saved = JSON.parse(window.localStorage.getItem(deletedFlashcardsKey) || '[]') as unknown; return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []; } catch { return []; } }

function alternateForm(question: Question): Question {
  const frames = ['During a focused clinical handover, ', 'In a comparable but newly presented scenario, ', 'While prioritizing care on a busy shift, ', 'During a safety review with the nursing team, '];
  return { ...question, id: `${question.id}-alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, stem: `${randomItem(frames)}${question.stem.charAt(0).toLowerCase()}${question.stem.slice(1)}`, isAlternateForm: true };
}

export default function StudyCompass() {
  const [view, setView] = useState<View>('landing');
  const [examTrack, setExamTrack] = useState<StudyTrack>('SNLE');
  const [snleQuestionSet, setSnleQuestionSet] = useState<SnleQuestionSetId>('nurse-quest-originals');
  const [domain, setDomain] = useState<LibraryDomain | 'All domains'>('All domains');
  const [topic, setTopic] = useState('All topics');
  const [mode, setMode] = useState<Mode>('Random topics');
  const [progress, setProgress] = useState<Progress>({});
  const [current, setCurrent] = useState<Question>(questions[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [flashcardMode, setFlashcardMode] = useState<'clinical' | 'custom'>('clinical');
  const [currentFlashcard, setCurrentFlashcard] = useState<Question | CustomFlashcard | null>(null);
  const [customFlashcards, setCustomFlashcards] = useState<CustomFlashcard[]>([]);
  const [deletedFlashcardIds, setDeletedFlashcardIds] = useState<string[]>([]);
  const [customFront, setCustomFront] = useState('');
  const [customBack, setCustomBack] = useState('');
  const [customFlashcardError, setCustomFlashcardError] = useState('');
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [players, setPlayers] = useState<Players>({ SNLE: emptyPlayer(), PNLE: emptyPlayer(), USRN: emptyPlayer() });
  const [celebration, setCelebration] = useState<Celebration>(null);
  const [pepTalk, setPepTalk] = useState<PepTalk>(null);
  const [resourceTrack, setResourceTrack] = useState<StudyTrack>('SNLE');
  const [accountUser, setAccountUser] = useState<AccountUser | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountMode, setAccountMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'local' | 'syncing' | 'saved' | 'pending'>('local');
  const skipInitialSessionWrite = useRef(true);
  const allTrackQuestions = useMemo(() => questions.filter(question => question.track === examTrack && (examTrack !== 'SNLE' || question.questionSet === snleQuestionSet)), [examTrack, snleQuestionSet]);
  const activeQuestions = useMemo(() => allTrackQuestions.filter(question => question.variantNumber === 0), [allTrackQuestions]);
  const activeDomains = useMemo(() => domainsForTrack(examTrack), [examTrack]);
  const player = players[examTrack];

  const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`/api${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.');
    return data as T;
  };

  const applyCloudSnapshot = useCallback((snapshot: CloudSnapshot) => {
    setProgress(local => {
      const merged = { ...local };
      for (const [id, remote] of Object.entries(snapshot.progress || {})) if (!merged[id] || new Date(remote.answeredAt).getTime() >= new Date(merged[id].answeredAt).getTime()) merged[id] = remote;
      try { window.localStorage.setItem(storageKey, JSON.stringify(merged)); } catch {}
      return merged;
    });
    setPlayers(local => {
      const merged = { ...local };
      for (const track of ['SNLE', 'PNLE', 'USRN'] as StudyTrack[]) {
        const remote = snapshot.players?.[track];
        if (remote && new Date(remote.updatedAt).getTime() >= new Date(merged[track].updatedAt).getTime()) merged[track] = remote;
      }
      try { window.localStorage.setItem(playerKey, JSON.stringify(merged)); } catch {}
      return merged;
    });
    setCustomFlashcards(local => {
      const merged = new Map(local.map(card => [card.id, card]));
      for (const remote of snapshot.flashcards || []) {
        const localCard = merged.get(remote.id);
        if (!localCard || new Date(remote.updatedAt).getTime() >= new Date(localCard.updatedAt).getTime()) merged.set(remote.id, remote);
      }
      const next = [...merged.values()].filter(card => !deletedFlashcardIds.includes(card.id));
      try { window.localStorage.setItem(customFlashcardsKey, JSON.stringify(next)); } catch {}
      return next;
    });
    if (snapshot.savedSession) setSavedSession(local => !local || new Date(snapshot.savedSession!.savedAt).getTime() >= new Date(local.savedAt).getTime() ? snapshot.savedSession : local);
  }, [deletedFlashcardIds]);

  const loadCloudAccount = useCallback(async () => {
    setAccountLoading(true);
    try {
      const session = await api<{ user?: AccountUser }>('/auth/get-session');
      if (!session.user) { setAccountUser(null); setCloudReady(false); setCloudStatus('local'); return; }
      setAccountUser(session.user);
      const snapshot = await api<CloudSnapshot>('/sync');
      applyCloudSnapshot(snapshot);
      setCloudReady(true); setCloudStatus('saved');
      setView(current => current === 'landing' ? 'home' : current);
    } catch { setAccountUser(null); setCloudReady(false); setCloudStatus('local'); }
    finally { setAuthChecked(true); setAccountLoading(false); }
  }, [applyCloudSnapshot]);

  const syncCloud = useCallback(async () => {
    if (!accountUser || !cloudReady) return;
    setCloudStatus('syncing');
    try {
      const snapshot = await api<CloudSnapshot>('/sync', { method: 'PUT', body: JSON.stringify({ flashcards: customFlashcards, deletedFlashcardIds, progress, players, savedSession }) });
      applyCloudSnapshot(snapshot);
      setDeletedFlashcardIds([]);
      try { window.localStorage.removeItem(deletedFlashcardsKey); } catch {}
      setCloudStatus('saved');
    } catch { setCloudStatus('pending'); }
  }, [accountUser, applyCloudSnapshot, cloudReady, customFlashcards, deletedFlashcardIds, players, progress, savedSession]);

  useEffect(() => {
    setProgress(loadProgress());
    setSavedSession(loadSession());
    setPlayers(loadPlayers());
    setCustomFlashcards(loadCustomFlashcards());
    setDeletedFlashcardIds(loadDeletedFlashcards());
    setStorageLoaded(true);
  }, []);

  useEffect(() => { if (storageLoaded) void loadCloudAccount(); }, [loadCloudAccount, storageLoaded]);

  useEffect(() => {
    if (!cloudReady) return;
    const timer = window.setTimeout(() => { void syncCloud(); }, 800);
    return () => window.clearTimeout(timer);
  }, [cloudReady, customFlashcards, deletedFlashcardIds, players, progress, savedSession, syncCloud]);

  useEffect(() => {
    if (!storageLoaded || window.localStorage.getItem(pepTalkKey)) return;
    setPepTalk({ emoji: '💜', title: 'Hey girl, you’ve got this.', message: 'One calm question at a time. Future you is already proud.' });
  }, [storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    if (skipInitialSessionWrite.current) { skipInitialSessionWrite.current = false; return; }
    const nextSession: SavedSession = { current, track: examTrack, questionSet: snleQuestionSet, domain, topic, mode, selected, revealed, savedAt: new Date().toISOString() };
    try { window.localStorage.setItem(sessionKey, JSON.stringify(nextSession)); } catch {}
    setSavedSession(nextSession);
  }, [current, domain, examTrack, mode, revealed, selected, snleQuestionSet, storageLoaded, topic]);

  const topics = useMemo(() => [...new Set(activeQuestions.filter(question => domain === 'All domains' || question.domain === domain).map(question => question.topic))], [activeQuestions, domain]);
  const summary = useMemo(() => {
    const attempts = activeQuestions.filter(question => progress[question.id]).map(question => progress[question.id]);
    const correct = attempts.filter(item => item.correct).length;
    return { answered: attempts.length, correct, accuracy: attempts.length ? Math.round(correct / attempts.length * 100) : 0 };
  }, [activeQuestions, progress]);
  const percent = Math.round(summary.answered / activeQuestions.length * 100) || 0;
  const domainStats = (name: LibraryDomain) => {
    const items = activeQuestions.filter(question => question.domain === name);
    const completed = items.filter(question => progress[question.id]);
    return { total: items.length, done: completed.length };
  };

  const pickQuestion = (nextTrack = examTrack, nextDomain = domain, nextTopic = topic, nextMode = mode, nextSnleSet = snleQuestionSet) => {
    const allLibraryQuestions = questions.filter(question => question.track === nextTrack && (nextTrack !== 'SNLE' || question.questionSet === nextSnleSet));
    const library = nextMode === 'All scenario forms' ? allLibraryQuestions : allLibraryQuestions.filter(question => question.variantNumber === 0);
    const inSelection = library.filter(question => (nextDomain === 'All domains' || question.domain === nextDomain) && (nextTopic === 'All topics' || question.topic === nextTopic));
    const pool = nextMode === 'Random topics' ? library : inSelection;
    if (!pool.length) return library[0];
    if (nextMode === 'Review incorrect') {
      const incorrect = pool.filter(question => progress[question.id] && !progress[question.id].correct);
      if (incorrect.length) return randomItem(incorrect);
    }
    if (nextMode === 'Weak spots rescue') {
      const weak = pool.filter(question => {
        const record = progress[question.id];
        return record && (!record.correct || record.confidence === 'guessed' || record.confidence === 'unsure');
      });
      if (weak.length) return randomItem(weak);
    }
    const unseen = pool.filter(question => !progress[question.id] && question.id !== current.id);
    if (unseen.length) return randomItem(unseen);
    const differentForm = pool.filter(question => question.id !== current.id);
    if (differentForm.length) return randomItem(differentForm);
    return alternateForm(pool[0]);
  };
  const startQuestion = (nextTrack = examTrack, nextDomain = domain, nextTopic = topic, nextMode = mode, nextSnleSet = snleQuestionSet) => {
    setCurrent(pickQuestion(nextTrack, nextDomain, nextTopic, nextMode, nextSnleSet));
    setSelected(null); setRevealed(false);
  };
  const selectTrack = (track: StudyTrack, start = false) => {
    setExamTrack(track); setDomain('All domains'); setTopic('All topics'); setMode('Random topics'); setFlipped(new Set());
    if (start) { startQuestion(track, 'All domains', 'All topics', 'Random topics'); setView('study'); }
  };
  const selectSnleQuestionSet = (set: SnleQuestionSetId, start = false) => {
    setExamTrack('SNLE'); setSnleQuestionSet(set); setDomain('All domains'); setTopic('All topics'); setMode('Random topics'); setFlipped(new Set());
    if (start) { startQuestion('SNLE', 'All domains', 'All topics', 'Random topics', set); setView('study'); }
  };
  const saveAnswer = (index: number) => {
    if (selected !== null) return;
    const isCorrect = index === current.correctIndex;
    const nextProgress = { ...progress, [current.id]: { correct: isCorrect, selected: index, answeredAt: new Date().toISOString(), alternate: current.isAlternateForm, confidence: isCorrect ? 'unsure' as Confidence : 'guessed' as Confidence } };
    setSelected(index); setProgress(nextProgress);
    try { window.localStorage.setItem(storageKey, JSON.stringify(nextProgress)); } catch {}
    setPlayers(previous => {
      const previousTrack = previous[current.track];
      const nextCorrect = previousTrack.correct + (isCorrect ? 1 : 0);
      const nextStreak = isCorrect ? previousTrack.streak + 1 : 0;
      const newlyUnlocked = isCorrect ? rewards.find(reward => nextCorrect >= reward.threshold && !previousTrack.unlocked.includes(reward.id)) : undefined;
      const nextPlayer: Player = { xp: previousTrack.xp + (isCorrect ? 12 + Math.min(nextStreak, 8) : 2), streak: nextStreak, bestStreak: Math.max(previousTrack.bestStreak, nextStreak), correct: nextCorrect, unlocked: newlyUnlocked ? [...previousTrack.unlocked, newlyUnlocked.id] : previousTrack.unlocked, updatedAt: new Date().toISOString() };
      const next = { ...previous, [current.track]: nextPlayer };
      try { window.localStorage.setItem(playerKey, JSON.stringify(next)); } catch {}
      if (newlyUnlocked) setCelebration(newlyUnlocked);
      return next;
    });
  };
  const saveConfidence = (confidence: Confidence) => {
    const existing = progress[current.id];
    if (!existing) return;
    const nextProgress = { ...progress, [current.id]: { ...existing, confidence } };
    setProgress(nextProgress);
    try { window.localStorage.setItem(storageKey, JSON.stringify(nextProgress)); } catch {}
  };

  const persistCustomFlashcards = (next: CustomFlashcard[]) => {
    setCustomFlashcards(next);
    try {
      window.localStorage.setItem(customFlashcardsKey, JSON.stringify(next));
      setCustomFlashcardError('');
    } catch { setCustomFlashcardError('Your card is here for this visit, but browser storage is full or unavailable.'); }
  };
  const addCustomFlashcard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const front = customFront.trim();
    const back = customBack.trim();
    if (!front || !back) { setCustomFlashcardError('Add both the front and the answer before saving your card.'); return; }
    const now = new Date().toISOString();
    persistCustomFlashcards([...customFlashcards, { id: `my-card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, track: examTrack, front, back, createdAt: now, dueAt: now, intervalDays: 0, reviewCount: 0, updatedAt: now }]);
    setCustomFront(''); setCustomBack('');
  };
  const reviewCustomFlashcard = (id: string, remembered: boolean) => {
    const reviewTime = Date.now();
    persistCustomFlashcards(customFlashcards.map(card => {
      if (card.id !== id) return card;
      const intervalDays = remembered ? Math.min(card.intervalDays ? card.intervalDays * 2 : 1, 30) : 0;
      const waitMilliseconds = remembered ? intervalDays * 24 * 60 * 60 * 1000 : 10 * 60 * 1000;
      return { ...card, intervalDays, reviewCount: card.reviewCount + 1, dueAt: new Date(reviewTime + waitMilliseconds).toISOString(), updatedAt: new Date(reviewTime).toISOString() };
    }));
    setFlipped(previous => { const next = new Set(previous); next.delete(id); return next; });
  };
  const deleteCustomFlashcard = (id: string) => {
    persistCustomFlashcards(customFlashcards.filter(card => card.id !== id));
    setDeletedFlashcardIds(previous => {
      const next = previous.includes(id) ? previous : [...previous, id];
      try { window.localStorage.setItem(deletedFlashcardsKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const submitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const name = String(form.get('name') || '').trim();
    setAccountError(''); setAccountLoading(true);
    try {
      if (accountMode === 'signup') await api('/auth/sign-up/email', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      else await api('/auth/sign-in/email', { method: 'POST', body: JSON.stringify({ email, password }) });
      await loadCloudAccount();
      setView('home');
    } catch (error) { setAccountError(error instanceof Error ? error.message : 'Unable to sign in right now.'); }
    finally { setAccountLoading(false); }
  };
  const signOut = async () => {
    try { await api('/auth/sign-out', { method: 'POST', body: JSON.stringify({}) }); } catch {}
    setAccountUser(null); setCloudReady(false); setCloudStatus('local'); navigate('landing');
  };

  const openAccount = (nextMode: 'signin' | 'signup' = 'signin') => { setAccountMode(nextMode); setAccountError(''); setShowPassword(false); setView('account'); };
  const navigate = (next: View) => {
    if (!accountUser && next !== 'landing' && next !== 'account') { openAccount('signin'); return; }
    setView(next); setSelected(null); setRevealed(false);
  };
  const closePepTalk = () => { setPepTalk(null); try { window.localStorage.setItem(pepTalkKey, 'seen'); } catch {} };
  const openTrack = (track: StudyTrack) => { setResourceTrack(track); setView('resources'); };
  const chooseDomain = (nextDomain: LibraryDomain) => { setDomain(nextDomain); setTopic('All topics'); setMode('Fresh in selection'); startQuestion(examTrack, nextDomain, 'All topics', 'Fresh in selection'); setView('study'); };
  const resumeSession = () => {
    if (!savedSession) return;
    const validTrack = savedSession.track === 'PNLE' || savedSession.track === 'USRN' ? savedSession.track : 'SNLE';
    const validDomain = savedSession.current.track === validTrack ? savedSession.domain : 'All domains';
    setExamTrack(validTrack); setSnleQuestionSet(savedSession.questionSet || 'nurse-quest-originals'); setDomain(validDomain); setTopic(savedSession.topic); setMode(savedSession.mode); setCurrent(savedSession.current); setSelected(savedSession.selected); setRevealed(savedSession.revealed); setView('study');
  };
  const selectedCorrect = selected === current.correctIndex;
  const showRationale = selectedCorrect || revealed;
  const flashcards = activeQuestions.filter(question => question.variantNumber === 0 && (domain === 'All domains' || question.domain === domain));
  const customCardsForTrack = customFlashcards.filter(card => card.track === examTrack);
  const dueCustomCards = customCardsForTrack.filter(card => new Date(card.dueAt).getTime() <= Date.now());
  const flashcardPool = (nextMode = flashcardMode): Array<Question | CustomFlashcard> => nextMode === 'custom' ? (dueCustomCards.length ? dueCustomCards : customCardsForTrack) : flashcards;
  const startFlashcardRound = (nextMode: 'clinical' | 'custom') => {
    const pool = flashcardPool(nextMode);
    if (!pool.length) return;
    setFlashcardMode(nextMode); setCurrentFlashcard(randomItem(pool)); setFlipped(new Set()); setView('flashcardStudy');
  };
  const nextFlashcard = () => {
    const pool = flashcardPool();
    const options = pool.filter(card => card.id !== currentFlashcard?.id);
    if (pool.length) { setCurrentFlashcard(randomItem(options.length ? options : pool)); setFlipped(new Set()); }
  };
  const level = Math.floor(player.xp / 100) + 1;
  const nextReward = rewards.find(reward => !player.unlocked.includes(reward.id));
  const trackLabel = examTrack === 'SNLE' ? 'SNLE · Saudi Arabia' : examTrack === 'PNLE' ? 'PNLE · Philippines' : 'USRN · NCLEX-RN 2026';
  const snleSetLabel = snleQuestionSets.find(set => set.id === snleQuestionSet)?.label || 'Nurse Quest originals';
  const openNewRound = () => examTrack === 'SNLE' ? setView('snleSetSetup') : selectTrack(examTrack, true);

  const header = (active: View) => <header className="nav">
    <button className="brand" onClick={() => navigate(accountUser ? 'home' : 'landing')} aria-label="Nurse Quest home"><span className="mark">N</span> Nurse Quest</button>
    {!accountUser ? <div className="nav-actions"><button className="nav-link" onClick={() => openAccount('signin')}>Sign in</button><button className="primary nav-cta" onClick={() => openAccount('signup')}>Create account</button></div> : <div className="nav-actions">
      <button className={`nav-link ${active === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>Overview</button>
      <button className={`nav-link ${active === 'study' || active === 'practiceSetup' || active === 'snleSetSetup' ? 'active' : ''}`} onClick={() => navigate('practiceSetup')}>Practice</button>
      <button className={`nav-link ${active === 'flashcards' ? 'active' : ''}`} onClick={() => navigate('flashcards')}>Flashcards</button>
      <button className={`nav-link ${active === 'rewards' ? 'active' : ''}`} onClick={() => navigate('rewards')}>Rewards</button>
      <button className={`nav-link ${active === 'resources' ? 'active' : ''}`} onClick={() => openTrack(examTrack)}>Library</button>
      <button className={`nav-link ${active === 'account' ? 'active' : ''}`} onClick={() => navigate('account')}>Account</button>
    </div>}
  </header>;

  if (!authChecked) return <main className="shell"><section className="auth-loading" aria-live="polite"><span className="mark">N</span><p>Opening your study space…</p></section></main>;

  if (!accountUser && view === 'landing') return <main className="shell landing-shell">{header('landing')}<section className="landing-hero"><div className="landing-copy"><p className="eyebrow">Nursing exam practice, made personal</p><h1>Your calm corner<br />for the next exam.</h1><p>Original SNLE, PNLE, and USRN practice, flashcards, focused rescue rounds, and progress that follows you from one study session to the next.</p><div className="hero-buttons"><button className="primary" onClick={() => openAccount('signup')}>Create your free account <span aria-hidden="true">→</span></button><button className="secondary" onClick={() => openAccount('signin')}>I already have an account</button></div><p className="landing-note">Your study history stays private to your account.</p></div><div className="landing-preview" aria-label="A preview of the Nurse Quest study experience"><div className="preview-glow" /><p className="eyebrow">Your next session</p><div className="preview-question"><span>SNLE · Fundamentals</span><h2>One clear question at a time.</h2><div><i /><i /><i /><i /></div></div><div className="preview-stats"><span>✦ Weak spots rescue</span><span>☁ Progress saved</span></div></div></section><section className="landing-benefits"><article><span>🧠</span><h2>Practice with purpose</h2><p>Choose a question library, a domain, or a focused round whenever you sit down.</p></article><article><span>🗂️</span><h2>Make it yours</h2><p>Build private flashcards from your own notes and review them on your schedule.</p></article><article><span>↗</span><h2>Pick up anywhere</h2><p>Your questions, rewards, cards, and current round are kept with your account.</p></article></section></main>;

  if (view === 'account') return <main className="shell">{header('account')}<section className="custom-flashcard-panel" style={{ marginTop: 0 }}>
    {accountUser ? <><div><p className="eyebrow">Cloud study space</p><h1 className="page-title">Hi, {accountUser.name || 'learner'}.</h1><p>Your flashcards, progress, rewards, and saved round are linked to this account.</p><p className="source-note">Sync status: <b>{cloudStatus === 'saved' ? 'Saved to your account' : cloudStatus === 'syncing' ? 'Saving…' : cloudStatus === 'pending' ? 'Saved on this device; waiting to sync' : 'Using this device only'}</b></p></div><div className="custom-flashcard-form"><p><b>{accountUser.email}</b></p><button className="primary" type="button" onClick={() => void syncCloud()} disabled={cloudStatus === 'syncing'}>Sync now</button><button className="secondary" type="button" onClick={() => void signOut()}>Sign out</button></div></> : <><div><p className="eyebrow">Your private study space</p><h1 className="page-title">Come in.<br />Your progress is here.</h1><p>{accountMode === 'signin' ? 'Sign in to continue your questions, flashcards, rewards, and rescue rounds.' : 'Create your account once, then come back to the same progress on any device.'}</p><ul className="account-trust"><li>Private progress and flashcards</li><li>Secure, signed-in sessions</li><li>No Google account required</li></ul></div><form className="custom-flashcard-form account-form" onSubmit={submitAccount}>
      <div className="track-toggle"><button type="button" className={accountMode === 'signin' ? 'selected' : ''} onClick={() => { setAccountMode('signin'); setAccountError(''); }}>Sign in</button><button type="button" className={accountMode === 'signup' ? 'selected' : ''} onClick={() => { setAccountMode('signup'); setAccountError(''); }}>Create account</button></div>
      {accountMode === 'signup' && <><label htmlFor="account-name">First name</label><input id="account-name" name="name" required minLength={2} maxLength={80} autoComplete="given-name" placeholder="How should we call you?" /></>}
      <label htmlFor="account-email">Email address</label><input id="account-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
      <label htmlFor="account-password">Password <span>At least 12 characters</span></label><div className="password-field"><input id="account-password" name="password" type={showPassword ? 'text' : 'password'} required minLength={12} maxLength={128} autoComplete={accountMode === 'signin' ? 'current-password' : 'new-password'} placeholder={accountMode === 'signin' ? 'Your password' : 'Create a strong password'} /><button type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div>
      <div className="custom-form-foot"><small>{accountMode === 'signin' ? 'Welcome back — your learning space is waiting.' : 'Your password is never stored in plain text.'}</small><button className="primary" type="submit" disabled={accountLoading}>{accountLoading ? 'Please wait…' : accountMode === 'signin' ? 'Continue →' : 'Create my account →'}</button></div>{accountError && <p className="custom-card-error" role="alert">{accountError}</p>}
    </form></>}
  </section></main>;

  if (view === 'resources') return <main className="shell">{header('resources')}<section className="section" style={{ marginTop: 0 }}>
    <p className="eyebrow">Your study library</p><h1 className="page-title">Choose the exam first.<br />Then choose what helps.</h1>
    <p className="hero-copy">Official references and legitimate commercial companions for each country. Use them to understand topics—never to copy or circulate protected reviewer questions.</p>
    <div className="track-toggle"><button className={resourceTrack === 'SNLE' ? 'selected' : ''} onClick={() => setResourceTrack('SNLE')}>🇸🇦 SNLE · Saudi Arabia</button><button className={resourceTrack === 'PNLE' ? 'selected' : ''} onClick={() => setResourceTrack('PNLE')}>🇵🇭 PNLE · Philippines</button><button className={resourceTrack === 'USRN' ? 'selected' : ''} onClick={() => setResourceTrack('USRN')}>🇺🇸 USRN · NCLEX-RN 2026</button></div>
    <div className="resource-grid">{studyResources[resourceTrack].map(resource => <a className="resource-card" key={resource.title} href={resource.href} target="_blank" rel="noreferrer"><span>{resource.kind}</span><h2>{resource.title}</h2><p>{resource.text}</p><b>Open resource ↗</b></a>)}</div>
    <article className="track-note"><span>{resourceTrack === 'SNLE' ? '🇸🇦' : resourceTrack === 'PNLE' ? '🇵🇭' : '🇺🇸'}</span><div><h2>{resourceTrack === 'SNLE' ? 'SNLE question library' : resourceTrack === 'PNLE' ? 'PNLE question library' : 'USRN / NCLEX-RN 2026 question library'}—separate by design.</h2><p>Open a {resourceTrack} round to use only original {resourceTrack === 'SNLE' ? 'Saudi-focused' : resourceTrack === 'PNLE' ? 'Philippine-focused' : 'USRN / NCLEX-RN 2026-focused'} questions, flashcards, progress, and rewards. Nothing is mixed across exam libraries.</p><button className="primary" onClick={() => selectTrack(resourceTrack, true)}>Open {resourceTrack} question library →</button></div></article>
  </section></main>;

  if (view === 'rewards') return <main className="shell">{header('rewards')}<section className="section" style={{ marginTop: 0 }}>
    <p className="eyebrow">{trackLabel} · Your little wins</p><h1 className="page-title">Every answer is<br />a tiny level-up.</h1>
    <div className="game-stats"><article><span>LEVEL</span><strong>{level}</strong><p>{player.xp} XP in this library</p></article><article><span>BEST STREAK</span><strong>{player.bestStreak}</strong><p>Correct in a row</p></article><article><span>CLINICAL WINS</span><strong>{player.correct}</strong><p>Correct answers</p></article></div>
    <div className="section-head" style={{ marginTop: 44 }}><div><p className="eyebrow">Badge shelf</p><h2>Keep going for these</h2></div>{nextReward && <p>{nextReward.threshold - player.correct > 0 ? `${nextReward.threshold - player.correct} more correct for ${nextReward.title}` : 'New reward ready!'}</p>}</div>
    <div className="badge-grid">{rewards.map(reward => { const unlocked = player.unlocked.includes(reward.id); return <article className={`badge ${unlocked ? 'unlocked' : ''}`} key={reward.id}><span>{reward.emoji}</span><h2>{reward.title}</h2><p>{reward.message}</p><b>{unlocked ? 'Unlocked!' : `${reward.threshold} correct answers`}</b></article>; })}</div>
  </section></main>;

  if (view === 'flashcardStudy' && currentFlashcard) {
    const customCard = flashcardMode === 'custom';
    const personalCard = currentFlashcard as CustomFlashcard;
    const clinicalCard = currentFlashcard as Question;
    const isFlipped = flipped.has(currentFlashcard.id);
    const nextInterval = customCard ? Math.min(personalCard.intervalDays ? personalCard.intervalDays * 2 : 1, 30) : 0;
    const removeCurrentCard = () => {
      deleteCustomFlashcard(currentFlashcard.id);
      const remaining = customCardsForTrack.filter(card => card.id !== currentFlashcard.id);
      if (remaining.length) { setCurrentFlashcard(randomItem(remaining)); setFlipped(new Set()); } else { navigate('flashcards'); }
    };
    return <main className="shell">{header('flashcards')}<section className="flashcard-study" style={{ marginTop: 0 }}><button className="back-link" onClick={() => navigate('flashcards')}>← Back to flashcards</button><p className="eyebrow">{customCard ? `My ${examTrack} deck` : `${trackLabel} · clinical anchors`}</p><h1 className="page-title">One calm card<br />at a time.</h1><p className="flashcard-study-copy">{customCard ? 'Say the answer first, then flip it. Rate it honestly and let the little deck work for you.' : 'A fresh clinical anchor, chosen at random. Think first, then tap to reveal.'}</p><article className="single-flashcard"><button type="button" className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setFlipped(previous => { const next = new Set(previous); next.has(currentFlashcard.id) ? next.delete(currentFlashcard.id) : next.add(currentFlashcard.id); return next; })}><span className="front">{customCard ? `My ${examTrack} card` : clinicalCard.topic}</span><h2>{customCard ? personalCard.front : clinicalCard.stem}</h2><p className="front">Tap to reveal</p><div className="back"><span className="back-label">{customCard ? 'Your answer / note' : 'Best response'}</span><h2>{customCard ? personalCard.back : clinicalCard.choices[clinicalCard.correctIndex]}</h2><p>{customCard ? (personalCard.reviewCount ? `Reviewed ${personalCard.reviewCount} time${personalCard.reviewCount === 1 ? '' : 's'}.` : 'A fresh card—nice one.') : clinicalCard.rationale}</p></div></button>{isFlipped && customCard && <div className="single-flashcard-actions"><button className="secondary" type="button" onClick={() => { reviewCustomFlashcard(currentFlashcard.id, false); nextFlashcard(); }}>Again · 10 min</button><button className="primary" type="button" onClick={() => { reviewCustomFlashcard(currentFlashcard.id, true); nextFlashcard(); }}>Got it · {nextInterval} day{nextInterval === 1 ? '' : 's'}</button></div>}<div className="single-flashcard-footer"><button className="secondary" type="button" onClick={nextFlashcard}>Next random card →</button>{customCard && <button className="reset" type="button" onClick={removeCurrentCard}>Delete this card</button>}</div></article></section></main>;
  }

  if (view === 'flashcards') return <main className="shell">{header('flashcards')}<section className="custom-flashcard-panel" style={{ marginTop: 0 }}>
    <div><p className="eyebrow">Your own little deck · {trackLabel}</p><h1 className="page-title">Make it yours,<br />one card at a time.</h1><p>Turn tricky notes, mnemonics, and “ohhh, that’s why” moments into private cards for this library.</p>{accountUser && <p className="source-note">Cloud sync: <b>{cloudStatus === 'saved' ? 'saved' : cloudStatus === 'syncing' ? 'saving…' : 'pending'}</b></p>}</div>
    <form className="custom-flashcard-form" onSubmit={addCustomFlashcard}>
      <label htmlFor="custom-card-front">Front of card <span>Question or cue</span></label><textarea id="custom-card-front" value={customFront} onChange={event => setCustomFront(event.target.value)} maxLength={500} placeholder="e.g. What is the priority before giving a new medication?" />
      <label htmlFor="custom-card-back">Back of card <span>Answer, explanation, or memory trick</span></label><textarea id="custom-card-back" value={customBack} onChange={event => setCustomBack(event.target.value)} maxLength={500} placeholder="e.g. Check the prescription, allergies, and patient identity first." />
      <div className="custom-form-foot"><small>Stays privately in this browser · {customFront.length + customBack.length}/1000</small><button className="primary" type="submit">Add to my {examTrack} deck →</button></div>
      {customFlashcardError && <p className="custom-card-error" role="alert">{customFlashcardError}</p>}
    </form>
  </section><section className="section flashcard-launch-section">
    <div className="section-head"><div><p className="eyebrow">Ready when she is</p><h2>Choose a little deck</h2></div><p>No card list here—each round starts fresh and random.</p></div>
    <div className="flashcard-launch-grid"><article><span>📝</span><p className="eyebrow">My {examTrack} cards</p><h3>Her own notes, made memorable.</h3><p>{customCardsForTrack.length ? `${dueCustomCards.length} due now · ${customCardsForTrack.length} saved` : 'Make a card above, then come back for a mini review.'}</p><button className="primary" disabled={!customCardsForTrack.length} onClick={() => startFlashcardRound('custom')}>Start my random deck →</button></article><article><span>✨</span><p className="eyebrow">Clinical anchors</p><h3>Practice built-in nursing cards.</h3><p>Choose a domain if she wants, then get one randomized card at a time.</p><div className="field"><label htmlFor="flash-domain">Focus domain</label><select id="flash-domain" value={domain} onChange={event => setDomain(event.target.value as LibraryDomain | 'All domains')}><option>All domains</option>{activeDomains.map(item => <option key={item.name}>{item.name}</option>)}</select></div><button className="primary" onClick={() => startFlashcardRound('clinical')}>Start random clinical card →</button></article></div>
  </section></main>;

  if (view === 'snleSetSetup') return <main className="shell">{header('snleSetSetup')}<section className="section practice-setup" style={{ marginTop: 0 }}>
    <button className="back-link" onClick={() => navigate('practiceSetup')}>← Back to exam choices</button><p className="eyebrow">SNLE practice set</p><h1 className="page-title">Which SNLE set<br />are we opening?</h1><p className="hero-copy">Each set opens the same four-choice practice flow, with its own question progress. Every item in the app is an original teaching scenario.</p>
    <div className="practice-library-grid">{snleQuestionSets.map(set => <button className="practice-library-card snle-card" key={set.id} onClick={() => selectSnleQuestionSet(set.id, true)}><span>🇸🇦</span><small>SNLE QUESTION SET</small><h2>{set.label}</h2><p>{set.description}</p><b>Open this set →</b></button>)}</div>
  </section></main>;

  if (view === 'practiceSetup') return <main className="shell">{header('practiceSetup')}<section className="section practice-setup" style={{ marginTop: 0 }}>
    <p className="eyebrow">Practice first step</p><h1 className="page-title">Which exam are we<br />playing today?</h1><p className="hero-copy">Pick one library. Its first question will open right away, with only that exam’s progress and rewards.</p>
    <div className="practice-library-grid"><button className="practice-library-card snle-card" onClick={() => { setExamTrack('SNLE'); setView('snleSetSetup'); }}><span>🇸🇦</span><small>SAUDI ARABIA</small><h2>SNLE</h2><p>Choose from four original practice sets</p><b>Choose an SNLE set →</b></button><button className="practice-library-card pnle-card" onClick={() => selectTrack('PNLE', true)}><span>🇵🇭</span><small>PHILIPPINES</small><h2>PNLE</h2><p>20 original core questions</p><b>Start PNLE practice →</b></button><button className="practice-library-card usrn-card" onClick={() => selectTrack('USRN', true)}><span>🇺🇸</span><small>UNITED STATES</small><h2>USRN 2026</h2><p>40 original NCLEX-RN questions</p><b>Start USRN practice →</b></button></div>
  </section></main>;

  if (view === 'study') return <main className="shell">{header('study')}<div className="study-layout">
    <aside className="study-controls"><div className="study-controls-head"><h2>Shape your set</h2><button className="mobile-control-toggle" aria-expanded={controlsOpen} aria-controls="study-set-controls" onClick={() => setControlsOpen(open => !open)}>{controlsOpen ? 'Done' : 'Filters'} <span aria-hidden="true">{controlsOpen ? '↑' : '☰'}</span></button></div>
      <div className={`control-body ${controlsOpen ? 'open' : ''}`} id="study-set-controls"><div className="field"><label htmlFor="exam-track">Question library</label><select id="exam-track" value={examTrack} onChange={event => selectTrack(event.target.value as StudyTrack, true)}><option value="SNLE">SNLE · Saudi Arabia</option><option value="PNLE">PNLE · Philippines</option><option value="USRN">USRN · NCLEX-RN 2026</option></select></div>
      {examTrack === 'SNLE' && <div className="field"><label htmlFor="snle-question-set">SNLE practice set</label><select id="snle-question-set" value={snleQuestionSet} onChange={event => selectSnleQuestionSet(event.target.value as SnleQuestionSetId, true)}>{snleQuestionSets.map(set => <option key={set.id} value={set.id}>{set.label}</option>)}</select></div>}
      <p className="library-rule">One library is active at a time. Your countries never mix.</p>
      <div className="field"><label htmlFor="domain">Domain</label><select id="domain" value={domain} onChange={event => { const next = event.target.value as LibraryDomain | 'All domains'; setDomain(next); setTopic('All topics'); setMode('Fresh in selection'); }}><option>All domains</option>{activeDomains.map(item => <option key={item.name}>{item.name}</option>)}</select></div>
      <div className="field"><label htmlFor="topic">Topic</label><select id="topic" value={topic} onChange={event => { setTopic(event.target.value); setMode('Fresh in selection'); }}><option>All topics</option>{topics.map(item => <option key={item}>{item}</option>)}</select></div>
      <div className="field"><label htmlFor="mode">Mode</label><select id="mode" value={mode} onChange={event => setMode(event.target.value as Mode)}><option>Random topics</option><option>Fresh in selection</option><option>All scenario forms</option><option>Review incorrect</option><option>Weak spots rescue</option></select></div>
      <p className="filter-note">Normal modes use each original core question once before a repeat. “All scenario forms” intentionally includes alternate situations for the same clinical concept. “Weak spots rescue” brings back missed, guessed, and unsure answers. Your filter choices apply after you answer this question.</p>
      <div className="progress-caption"><span>{summary.answered} answered</span><span>{activeQuestions.length} {examTrack} forms</span></div><div className="bar"><i style={{ width: `${percent}%` }} /></div></div>
    </aside>
    <section className="question-card"><div className="question-meta"><span className="tag">{current.track} · {current.domain}</span>{current.track === 'SNLE' && <span className="difficulty">{snleSetLabel}</span>}<span className="difficulty">{current.isAlternateForm ? 'ALTERNATE FORM' : `SCENARIO ${current.variantNumber + 1}`}</span></div>
      <h1 className="question-title">{current.stem}</h1><div className="answer-list">{current.choices.map((choice, index) => { const wrong = selected !== null && selected === index && index !== current.correctIndex; const correct = selected !== null && index === current.correctIndex && showRationale; return <button className={`answer-btn ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} disabled={selected !== null} key={choice} onClick={() => saveAnswer(index)}><span className="letter">{letters[index]}</span><span>{choice}</span></button>; })}</div>
      {selected !== null && <div className={`feedback ${selectedCorrect ? 'good' : 'bad'}`}><h3>{selectedCorrect ? 'Correct — keep the clinical priority.' : 'Not quite — pause before moving on.'}</h3>{showRationale ? <><p className="rationale"><strong>Rationale:</strong> {current.rationale}</p><p className="question-reference">Suggested study reference: <a href={domainReferences[current.domain].href} target="_blank" rel="noreferrer">{domainReferences[current.domain].title} ↗</a></p></> : <p>Select <strong>Reveal answer</strong> to see the correct option and rationale, or move to a new question.</p>}<div className="confidence-check"><span>How did that feel?</span><button className={progress[current.id]?.confidence === 'confident' ? 'selected' : ''} type="button" onClick={() => saveConfidence('confident')}>Confident</button><button className={progress[current.id]?.confidence === 'unsure' ? 'selected' : ''} type="button" onClick={() => saveConfidence('unsure')}>Unsure</button><button className={progress[current.id]?.confidence === 'guessed' ? 'selected' : ''} type="button" onClick={() => saveConfidence('guessed')}>Guessed</button></div></div>}
      <div className="study-actions"><p className="muted">{selected === null ? <>Pick an answer to unlock the next question.</> : <>Your answer saves {accountUser ? 'to your account and this browser' : 'privately in this browser'}. Mark anything uncertain, then use <strong>Weak spots rescue</strong> for a focused second pass.</>}</p><div className="hero-buttons">{selected !== null && !selectedCorrect && !revealed && <button className="secondary" onClick={() => setRevealed(true)}>Reveal answer</button>}{selected !== null && <button className="primary" onClick={() => startQuestion()}>Next question →</button>}</div></div>
    </section>
  </div>{celebration && <div className="celebration-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title"><article className="celebration-card"><span>{celebration.emoji}</span><p className="eyebrow">Reward unlocked · {current.track}</p><h2 id="reward-title">{celebration.title}</h2><p>{celebration.message}</p><div className="reward-score"><b>Level {level}</b><span>{player.xp} XP · {player.bestStreak} best streak</span></div><p className="share-note">Screenshot this little win and share it with your mentor or boss—no patient details, just your progress.</p><button className="primary" onClick={() => setCelebration(null)}>Keep playing →</button></article></div>}</main>;

  return <main className="shell">{header('home')}<section className="hero"><div><p className="eyebrow">Your little study corner · pick an exam</p><h1>One question.<br />One glow-up.</h1><p className="hero-copy">First choose your question library. Then take friendly clinical challenges, collect XP, and build confidence one calm decision at a time.</p>
    <div className="library-picker" aria-label="Choose question library"><button className={`library-choice ${examTrack === 'SNLE' ? 'selected' : ''}`} onClick={() => selectTrack('SNLE')}><span>🇸🇦</span><b>SNLE · Saudi Arabia</b><small>60 original core questions</small></button><button className={`library-choice ${examTrack === 'PNLE' ? 'selected' : ''}`} onClick={() => selectTrack('PNLE')}><span>🇵🇭</span><b>PNLE · Philippines</b><small>20 original core questions</small></button><button className={`library-choice ${examTrack === 'USRN' ? 'selected' : ''}`} onClick={() => selectTrack('USRN')}><span>🇺🇸</span><b>USRN · NCLEX-RN 2026</b><small>40 original NCLEX-RN questions</small></button></div>
    <p className="library-rule home-rule">Only one library is active at a time: questions, flashcards, progress, XP, and rewards never mix between exams.</p>
    <div className="hero-buttons"><button className="primary" onClick={openNewRound}>Play a new round <span aria-hidden="true">→</span></button>{savedSession && <button className="secondary" onClick={resumeSession}>Resume my round</button>}<button className="secondary" onClick={() => openTrack(examTrack)}>Open study library</button></div>
  </div><aside className="focus-card game-card"><div className="study-companion"><Image className="study-companion-cat" src="/images/nurse-study-cat.jpg" width={900} height={1350} priority unoptimized alt="A cozy nurse cat studying beside nursing notes" /></div><div className="player-card-copy"><p className="eyebrow">{trackLabel} · player card</p><div className="level-orb">{level}</div><h2>Level {level} learner<br /><em>{player.xp} XP collected</em></h2><div className="mini-progress">{Array.from({ length: 8 }, (_, index) => <span className={index < Math.round((player.xp % 100) / 12.5) ? 'done' : ''} key={index} />)}</div><p>{nextReward ? `${Math.max(0, nextReward.threshold - player.correct)} more correct answer${nextReward.threshold - player.correct === 1 ? '' : 's'} to unlock ${nextReward.emoji} ${nextReward.title}.` : 'Every badge is yours—keep your streak glowing.'}</p></div></aside></section>
  <section className="section"><div className="section-head"><div><p className="eyebrow">{trackLabel} · Pick your lane</p><h2>Practice by blueprint domain</h2></div><p>Tap a domain to start a focused set.</p></div><div className="grid">{activeDomains.map(item => <button className="topic-card" key={item.name} onClick={() => chooseDomain(item.name)}><span className="count">{item.target} TARGET · {domainStats(item.name).total} FORMS</span><h3>{item.name}</h3><p>{item.summary}</p></button>)}</div></section>
  <section className="section history"><article className="panel"><h3>Coverage, at a glance</h3>{activeDomains.map(item => { const stat = domainStats(item.name); const complete = stat.total ? Math.round(stat.done / stat.total * 100) : 0; return <div className="progress-row" key={item.name}><span>{item.name}</span><div className="bar"><i style={{ width: `${complete}%` }} /></div><b>{complete}%</b></div>; })}</article><article className="panel"><h3>Study sources for this library</h3><p className="empty">The blueprint guides the mix. Every domain points toward a public official safety, scope, or blueprint reference.</p><div className="source-list">{activeDomains.map(item => <a key={item.name} href={domainReferences[item.name].href} target="_blank" rel="noreferrer"><span>{item.name}</span>{domainReferences[item.name].title} ↗</a>)}</div><p className="source-note">Full official and commercial resource list: <button onClick={() => openTrack(examTrack)}>Study Library</button>.</p></article></section>
  {pepTalk && <aside className="pep-popup" role="dialog" aria-label="A little encouragement"><span>{pepTalk.emoji}</span><div><b>{pepTalk.title}</b><p>{pepTalk.message}</p></div><button onClick={closePepTalk} aria-label="Close encouragement">×</button></aside>}
  </main>;
}
