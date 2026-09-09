'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { domainReferences, domainsForTrack, questions, snleQuestionSets, usrnQuestionSets, type LibraryDomain, type Question, type QuestionSetId, type SnleQuestionSetId, type UsrnQuestionSetId } from '../lib/questions';
import { studyResources, type StudyTrack } from '../lib/resources';

type View = 'landing' | 'home' | 'practiceSetup' | 'snleSetSetup' | 'usrnSetSetup' | 'study' | 'results' | 'flashcards' | 'flashcardList' | 'flashcardStudy' | 'rewards' | 'resources' | 'account';
type Mode = 'Random topics' | 'Fresh in selection' | 'All scenario forms' | 'Review incorrect' | 'Weak spots rescue';
type Confidence = 'confident' | 'unsure' | 'guessed';
type StudyRecord = { correct: boolean; selected: number[]; answeredAt: string; alternate: boolean; confidence?: Confidence };
type Progress = Record<string, StudyRecord>;
type SavedSession = { current: Question; track: StudyTrack; questionSet?: QuestionSetId; domain: LibraryDomain | 'All domains'; topic: string; mode: Mode; selected: number[]; revealed: boolean; savedAt: string };
type Player = { xp: number; streak: number; bestStreak: number; correct: number; unlocked: string[]; updatedAt: string };
type Players = Record<StudyTrack, Player>;
type FlashcardFolder = { id: string; track: StudyTrack; name: string; createdAt: string; updatedAt: string };
type CustomFlashcard = { id: string; track: StudyTrack; front: string; back: string; folderId: string | null; createdAt: string; dueAt: string; intervalDays: number; reviewCount: number; updatedAt: string };
type AccountUser = { id: string; name: string; email: string };
type CloudSnapshot = { flashcards: CustomFlashcard[]; folders?: FlashcardFolder[]; progress: Progress; players: Players; savedSession: SavedSession | null };
type CompletedRound = { track: StudyTrack; questionSet?: QuestionSetId; domain: LibraryDomain | 'All domains'; topic: string; mode: Mode };
type Celebration = { title: string; message: string; emoji: string } | null;
type PepTalk = { title: string; message: string; emoji: string } | null;
type StudyCompassProps = { initialView?: View; initialTrack?: StudyTrack; initialSnleQuestionSet?: SnleQuestionSetId; initialUsrnQuestionSet?: UsrnQuestionSetId; initialFlashcardMode?: 'clinical' | 'custom' };

const storageKey = 'snle-study-compass-progress-v2';
const sessionKey = 'snle-study-compass-session-v1';
const playerKey = 'snle-study-compass-player-v1';
const pepTalkKey = 'nurse-quest-pep-talk-v1';
const customFlashcardsKey = 'nurse-quest-custom-flashcards-v1';
const flashcardFoldersKey = 'nurse-quest-flashcard-folders-v1';
const deletedFlashcardsKey = 'nurse-quest-deleted-flashcards-v1';
const accountKey = 'nurse-quest-account-v1';
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
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
    if (!saved?.current?.choices || saved.current.choices.length < 2 || typeof saved.current.stem !== 'string') return null;
    const track = saved.track === 'PNLE' || saved.track === 'USRN' ? saved.track : 'SNLE';
    const selected = Array.isArray(saved.selected) ? saved.selected.filter((index): index is number => typeof index === 'number') : typeof saved.selected === 'number' ? [saved.selected] : [];
    return { ...saved, track, questionSet: saved.questionSet || 'nurse-quest-originals', domain: saved.domain || 'All domains', selected } as SavedSession;
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
      typeof card.reviewCount === 'number' && Number.isFinite(card.reviewCount)).map(card => ({ ...card, folderId: typeof (card as Partial<CustomFlashcard>).folderId === 'string' ? (card as CustomFlashcard).folderId : null, updatedAt: typeof (card as Partial<CustomFlashcard>).updatedAt === 'string' ? (card as CustomFlashcard).updatedAt : card.createdAt }));
  } catch { return []; }
}
function loadFlashcardFolders(): FlashcardFolder[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(flashcardFoldersKey) || '[]') as unknown;
    if (!Array.isArray(saved)) return [];
    return saved.filter((folder): folder is FlashcardFolder => Boolean(folder) && typeof folder === 'object' &&
      typeof folder.id === 'string' && (folder.track === 'SNLE' || folder.track === 'PNLE' || folder.track === 'USRN') &&
      typeof folder.name === 'string' && folder.name.trim().length > 0 && folder.name.length <= 60 &&
      typeof folder.createdAt === 'string' && typeof folder.updatedAt === 'string');
  } catch { return []; }
}
function loadDeletedFlashcards(): string[] { try { const saved = JSON.parse(window.localStorage.getItem(deletedFlashcardsKey) || '[]') as unknown; return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []; } catch { return []; } }
function loadAccountUser(): AccountUser | null { try { const saved = JSON.parse(window.localStorage.getItem(accountKey) || 'null') as Partial<AccountUser> | null; return saved && typeof saved.id === 'string' && typeof saved.name === 'string' && typeof saved.email === 'string' ? saved as AccountUser : null; } catch { return null; } }

function alternateForm(question: Question): Question {
  const frames = ['During a focused clinical handover, ', 'In a comparable but newly presented scenario, ', 'While prioritizing care on a busy shift, ', 'During a safety review with the nursing team, '];
  return { ...question, id: `${question.id}-alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, stem: `${randomItem(frames)}${question.stem.charAt(0).toLowerCase()}${question.stem.slice(1)}`, isAlternateForm: true };
}

export default function StudyCompass({ initialView = 'landing', initialTrack = 'SNLE', initialSnleQuestionSet = 'nurse-quest-originals', initialUsrnQuestionSet = 'nurse-quest-originals', initialFlashcardMode = 'custom' }: StudyCompassProps) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [examTrack, setExamTrack] = useState<StudyTrack>(initialTrack);
  const [snleQuestionSet, setSnleQuestionSet] = useState<SnleQuestionSetId>(initialSnleQuestionSet);
  const [usrnQuestionSet, setUsrnQuestionSet] = useState<UsrnQuestionSetId>(initialUsrnQuestionSet);
  const [domain, setDomain] = useState<LibraryDomain | 'All domains'>('All domains');
  const [topic, setTopic] = useState('All topics');
  const [mode, setMode] = useState<Mode>('Random topics');
  const [progress, setProgress] = useState<Progress>({});
  const [current, setCurrent] = useState<Question>(() => questions.find(question => question.track === initialTrack && (initialTrack === 'PNLE' || question.questionSet === (initialTrack === 'SNLE' ? initialSnleQuestionSet : initialUsrnQuestionSet)) && question.variantNumber === 0) || questions[0]);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [flashcardMode, setFlashcardMode] = useState<'clinical' | 'custom'>('clinical');
  const [currentFlashcard, setCurrentFlashcard] = useState<Question | CustomFlashcard | null>(null);
  const [customFlashcards, setCustomFlashcards] = useState<CustomFlashcard[]>([]);
  const [flashcardFolders, setFlashcardFolders] = useState<FlashcardFolder[]>([]);
  const [deletedFlashcardIds, setDeletedFlashcardIds] = useState<string[]>([]);
  const [customFront, setCustomFront] = useState('');
  const [customBack, setCustomBack] = useState('');
  const [customFolderId, setCustomFolderId] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFlashcardIds, setSelectedFlashcardIds] = useState<string[]>([]);
  const [customFlashcardError, setCustomFlashcardError] = useState('');
  const [folderError, setFolderError] = useState('');
  const [folderActionMessage, setFolderActionMessage] = useState('');
  const [flashcardSuccess, setFlashcardSuccess] = useState<string | null>(null);
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
  const [authUnavailable, setAuthUnavailable] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'local' | 'syncing' | 'saved' | 'pending'>('local');
  const [completedRound, setCompletedRound] = useState<CompletedRound | null>(null);
  const skipInitialSessionWrite = useRef(true);
  const initialStudyRoute = useRef<string | null>(null);
  const initialFlashcardRoute = useRef(false);
  const activeQuestionSet = examTrack === 'SNLE' ? snleQuestionSet : examTrack === 'USRN' ? usrnQuestionSet : undefined;
  const allTrackQuestions = useMemo(() => questions.filter(question => question.track === examTrack && (examTrack === 'PNLE' || question.questionSet === activeQuestionSet)), [activeQuestionSet, examTrack]);
  const activeQuestions = useMemo(() => allTrackQuestions.filter(question => question.variantNumber === 0), [allTrackQuestions]);
  const activeDomains = useMemo(() => domainsForTrack(examTrack), [examTrack]);
  const player = players[examTrack];

  useEffect(() => {
    if (view !== 'study' || current.track === examTrack || !activeQuestions.length) return;
    setCurrent(activeQuestions[0]); setSelected([]); setRevealed(false);
  }, [activeQuestions, current.track, examTrack, view]);

  const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`/api${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (path === '/auth/sign-in/email' && response.status === 401) throw new Error('That email or password doesn’t match. Please try again.');
      throw new Error(typeof data.error === 'string' ? data.error : typeof data.message === 'string' ? data.message : 'Something went wrong. Please try again.');
    }
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
    setFlashcardFolders(local => {
      const merged = new Map(local.map(folder => [folder.id, folder]));
      for (const remote of snapshot.folders || []) {
        const localFolder = merged.get(remote.id);
        if (!localFolder || new Date(remote.updatedAt).getTime() >= new Date(localFolder.updatedAt).getTime()) merged.set(remote.id, remote);
      }
      const next = [...merged.values()];
      try { window.localStorage.setItem(flashcardFoldersKey, JSON.stringify(next)); } catch {}
      return next;
    });
    if (snapshot.savedSession) setSavedSession(local => !local || new Date(snapshot.savedSession!.savedAt).getTime() >= new Date(local.savedAt).getTime() ? snapshot.savedSession : local);
  }, [deletedFlashcardIds]);

  const loadCloudAccount = useCallback(async () => {
    setAccountLoading(true);
    try {
      const session = await api<{ user?: AccountUser } | null>('/auth/get-session');
      setAuthUnavailable(false);
      if (!session?.user) { try { window.localStorage.removeItem(accountKey); } catch {} setAccountUser(null); setCloudReady(false); setCloudStatus('local'); return; }
      setAccountUser(session.user);
      try { window.localStorage.setItem(accountKey, JSON.stringify(session.user)); } catch {}
      try {
        const snapshot = await api<CloudSnapshot>('/sync');
        applyCloudSnapshot(snapshot);
        setCloudStatus('saved');
      } catch {
        // A temporary sync outage must not turn an authenticated learner into a guest.
        setCloudStatus('pending');
      }
      setCloudReady(true);
      setView(current => current === 'landing' ? 'home' : current);
    } catch {
      // Keep a previously verified account usable while the session service reconnects.
      const cachedAccount = loadAccountUser();
      if (cachedAccount) { setAccountUser(cachedAccount); setCloudReady(false); setCloudStatus('pending'); setAuthUnavailable(false); setView(current => current === 'landing' ? 'home' : current); }
      else { setCloudReady(false); setCloudStatus('pending'); setAuthUnavailable(true); }
    }
    finally { setAuthChecked(true); setAccountLoading(false); }
  }, [applyCloudSnapshot]);

  const syncCloud = useCallback(async () => {
    if (!accountUser || !cloudReady) return;
    setCloudStatus('syncing');
    try {
      const snapshot = await api<CloudSnapshot>('/sync', { method: 'PUT', body: JSON.stringify({ flashcards: customFlashcards, folders: flashcardFolders, deletedFlashcardIds, progress, players, savedSession }) });
      applyCloudSnapshot(snapshot);
      setDeletedFlashcardIds([]);
      try { window.localStorage.removeItem(deletedFlashcardsKey); } catch {}
      setCloudStatus('saved');
    } catch { setCloudStatus('pending'); }
  }, [accountUser, applyCloudSnapshot, cloudReady, customFlashcards, deletedFlashcardIds, flashcardFolders, players, progress, savedSession]);

  useEffect(() => {
    setProgress(loadProgress());
    const localSession = loadSession();
    setSavedSession(localSession);
    if (localSession) {
      setExamTrack(localSession.track);
      if (localSession.track === 'SNLE') setSnleQuestionSet((localSession.questionSet as SnleQuestionSetId) || 'nurse-quest-originals');
      if (localSession.track === 'USRN') setUsrnQuestionSet((localSession.questionSet as UsrnQuestionSetId) || 'nurse-quest-originals');
    }
    setPlayers(loadPlayers());
    setCustomFlashcards(loadCustomFlashcards());
    setFlashcardFolders(loadFlashcardFolders());
    setDeletedFlashcardIds(loadDeletedFlashcards());
    setStorageLoaded(true);
  }, []);

  useEffect(() => { if (storageLoaded) void loadCloudAccount(); }, [loadCloudAccount, storageLoaded]);

  useEffect(() => {
    if (!cloudReady) return;
    const timer = window.setTimeout(() => { void syncCloud(); }, 800);
    return () => window.clearTimeout(timer);
  }, [cloudReady, customFlashcards, deletedFlashcardIds, flashcardFolders, players, progress, savedSession, syncCloud]);

  useEffect(() => {
    if (!storageLoaded || window.localStorage.getItem(pepTalkKey)) return;
    setPepTalk({ emoji: '💜', title: 'Hey girl, you’ve got this.', message: 'One calm question at a time. Future you is already proud.' });
  }, [storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    if (skipInitialSessionWrite.current) { skipInitialSessionWrite.current = false; return; }
    const nextSession: SavedSession = { current, track: examTrack, questionSet: activeQuestionSet, domain, topic, mode, selected, revealed, savedAt: new Date().toISOString() };
    try { window.localStorage.setItem(sessionKey, JSON.stringify(nextSession)); } catch {}
    setSavedSession(nextSession);
  }, [activeQuestionSet, current, domain, examTrack, mode, revealed, selected, storageLoaded, topic]);

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
  const usrnSetStats = (set: UsrnQuestionSetId) => {
    const items = questions.filter(question => question.track === 'USRN' && question.questionSet === set && question.variantNumber === 0);
    return { total: items.length, done: items.filter(question => progress[question.id]).length };
  };

  const roundQuestions = (nextTrack = examTrack, nextDomain = domain, nextTopic = topic, nextMode = mode, nextQuestionSet: QuestionSetId | undefined = activeQuestionSet) => {
    const allLibraryQuestions = questions.filter(question => question.track === nextTrack && (nextTrack === 'PNLE' || question.questionSet === nextQuestionSet));
    const library = nextMode === 'All scenario forms' ? allLibraryQuestions : allLibraryQuestions.filter(question => question.variantNumber === 0);
    const inSelection = library.filter(question => (nextDomain === 'All domains' || question.domain === nextDomain) && (nextTopic === 'All topics' || question.topic === nextTopic));
    return nextMode === 'Random topics' ? library : inSelection;
  };
  const pickQuestion = (nextTrack = examTrack, nextDomain = domain, nextTopic = topic, nextMode = mode, nextQuestionSet: QuestionSetId | undefined = activeQuestionSet): Question | null => {
    const pool = roundQuestions(nextTrack, nextDomain, nextTopic, nextMode, nextQuestionSet);
    if (!pool.length) return null;
    if (nextMode === 'Review incorrect') {
      const incorrect = pool.filter(question => progress[question.id] && !progress[question.id].correct);
      if (incorrect.length) return randomItem(incorrect);
      return null;
    }
    if (nextMode === 'Weak spots rescue') {
      const weak = pool.filter(question => {
        const record = progress[question.id];
        return record && (!record.correct || record.confidence === 'guessed' || record.confidence === 'unsure');
      });
      if (weak.length) return randomItem(weak);
      return null;
    }
    const unseen = pool.filter(question => !progress[question.id]);
    if (unseen.length) return randomItem(unseen);
    return null;
  };
  const startQuestion = (nextTrack = examTrack, nextDomain = domain, nextTopic = topic, nextMode = mode, nextQuestionSet: QuestionSetId | undefined = activeQuestionSet) => {
    const next = pickQuestion(nextTrack, nextDomain, nextTopic, nextMode, nextQuestionSet);
    if (!next) { setCompletedRound({ track: nextTrack, questionSet: nextTrack === 'PNLE' ? undefined : nextQuestionSet, domain: nextDomain, topic: nextTopic, mode: nextMode }); setView('results'); return; }
    setCurrent(next);
    setSelected([]); setRevealed(false);
  };
  const selectTrack = (track: StudyTrack, start = false) => {
    setExamTrack(track); setDomain('All domains'); setTopic('All topics'); setMode('Random topics'); setFlipped(new Set());
    const questionSet = track === 'SNLE' ? snleQuestionSet : track === 'USRN' ? usrnQuestionSet : undefined;
    if (start) { setView('study'); startQuestion(track, 'All domains', 'All topics', 'Random topics', questionSet); }
  };
  const selectSnleQuestionSet = (set: SnleQuestionSetId, start = false) => {
    setExamTrack('SNLE'); setSnleQuestionSet(set); setDomain('All domains'); setTopic('All topics'); setMode('Random topics'); setFlipped(new Set());
    if (start) { setView('study'); startQuestion('SNLE', 'All domains', 'All topics', 'Random topics', set); }
  };
  const openSnleQuestionSet = (set: SnleQuestionSetId) => router.push(`/practice/snle/${set}`);
  const selectUsrnQuestionSet = (set: UsrnQuestionSetId, start = false) => {
    setExamTrack('USRN'); setUsrnQuestionSet(set); setDomain('All domains'); setTopic('All topics'); setMode('Random topics'); setFlipped(new Set());
    if (start) { setView('study'); startQuestion('USRN', 'All domains', 'All topics', 'Random topics', set); }
  };
  const openUsrnQuestionSet = (set: UsrnQuestionSetId) => router.push(`/practice/nclex/${set.replace('nclex-challenge-', '')}`);
  const toggleAnswer = (index: number) => {
    if (progress[current.id]) return;
    if (current.correctIndices?.length) setSelected(previous => previous.includes(index) ? previous.filter(item => item !== index) : [...previous, index]);
    else { setSelected([index]); submitAnswer([index]); }
  };
  const submitAnswer = (answers = selected) => {
    if (!answers.length || progress[current.id]) return;
    const correctIndices = current.correctIndices || [current.correctIndex];
    const isCorrect = answers.length === correctIndices.length && answers.every(index => correctIndices.includes(index));
    const nextProgress = { ...progress, [current.id]: { correct: isCorrect, selected: [...answers], answeredAt: new Date().toISOString(), alternate: current.isAlternateForm, confidence: isCorrect ? 'unsure' as Confidence : 'guessed' as Confidence } };
    setProgress(nextProgress);
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
  useEffect(() => {
    if (initialView !== 'study' || !accountUser || !storageLoaded) return;
    const initialSet = initialTrack === 'SNLE' ? initialSnleQuestionSet : initialTrack === 'USRN' ? initialUsrnQuestionSet : undefined;
    const routeKey = `${initialTrack}:${initialSet || 'default'}`;
    if (initialStudyRoute.current === routeKey) return;
    initialStudyRoute.current = routeKey;
    setView('study'); setExamTrack(initialTrack); if (initialTrack === 'SNLE') setSnleQuestionSet(initialSnleQuestionSet); if (initialTrack === 'USRN') setUsrnQuestionSet(initialUsrnQuestionSet);
    if (savedSession && savedSession.track === initialTrack && savedSession.questionSet === initialSet) {
      setCurrent(savedSession.current); setSelected(savedSession.selected); setRevealed(savedSession.revealed); return;
    }
    const initialPool = questions.filter(question => question.track === initialTrack && (initialTrack === 'PNLE' || question.questionSet === initialSet) && question.variantNumber === 0);
    const unseen = initialPool.filter(question => !progress[question.id]);
    if (unseen.length) { setCurrent(randomItem(unseen)); setSelected([]); setRevealed(false); }
    else { setCompletedRound({ track: initialTrack, questionSet: initialSet, domain: 'All domains', topic: 'All topics', mode: 'Random topics' }); setView('results'); }
  }, [accountUser, initialSnleQuestionSet, initialTrack, initialUsrnQuestionSet, initialView, progress, savedSession, storageLoaded]);
  useEffect(() => {
    if (initialView !== 'flashcardStudy' || initialFlashcardRoute.current || !accountUser || !storageLoaded || accountLoading) return;
    const pool: Array<Question | CustomFlashcard> = initialFlashcardMode === 'custom' ? customFlashcards : activeQuestions;
    if (!pool.length) {
      if (initialFlashcardMode === 'custom' && !cloudReady) return;
      initialFlashcardRoute.current = true; setView('flashcards'); return;
    }
    initialFlashcardRoute.current = true; setFlashcardMode(initialFlashcardMode); setCurrentFlashcard(randomItem(pool)); setFlipped(new Set()); setView('flashcardStudy');
  }, [accountLoading, accountUser, activeQuestions, cloudReady, customFlashcards, examTrack, initialFlashcardMode, initialView, storageLoaded]);
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
  const persistFlashcardFolders = (next: FlashcardFolder[]) => {
    setFlashcardFolders(next);
    try {
      window.localStorage.setItem(flashcardFoldersKey, JSON.stringify(next));
      setFolderError('');
    } catch { setFolderError('Your folder is here for this visit, but browser storage is full or unavailable.'); }
  };
  const addFlashcardFolder = (event: FormEvent<HTMLFormElement>, track = examTrack) => {
    event.preventDefault();
    const name = newFolderName.trim();
    if (!name) { setFolderError('Give your folder a name first.'); return; }
    if (flashcardFolders.some(folder => folder.track === track && folder.name.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0)) { setFolderError('That folder already exists in this exam library.'); return; }
    const now = new Date().toISOString();
    const folder = { id: `my-folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, track, name, createdAt: now, updatedAt: now };
    persistFlashcardFolders([...flashcardFolders, folder]);
    setCustomFolderId(folder.id); setNewFolderName(''); setFolderActionMessage(`“${name}” is ready for your cards.`);
  };
  const addCustomFlashcard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const front = customFront.trim();
    const back = customBack.trim();
    if (!front || !back) { setCustomFlashcardError('Add both the front and the answer before saving your card.'); return; }
    const now = new Date().toISOString();
    const folderId = flashcardFolders.some(folder => folder.id === customFolderId && folder.track === examTrack) ? customFolderId : null;
    persistCustomFlashcards([...customFlashcards, { id: `my-card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, track: examTrack, front, back, folderId, createdAt: now, dueAt: now, intervalDays: 0, reviewCount: 0, updatedAt: now }]);
    setCustomFront(''); setCustomBack(''); setFlashcardSuccess(front);
  };
  const moveCustomFlashcards = (ids: string[], folderId: string) => {
    const destination = folderId || null;
    const folder = destination ? flashcardFolders.find(item => item.id === destination) : null;
    const cardsToMove = customFlashcards.filter(card => ids.includes(card.id) && (!folder || card.track === folder.track));
    if (!cardsToMove.length) { setFolderActionMessage('Choose cards from the same exam library as the folder.'); return; }
    const now = new Date().toISOString();
    persistCustomFlashcards(customFlashcards.map(card => cardsToMove.some(item => item.id === card.id) ? { ...card, folderId: destination, updatedAt: now } : card));
    setSelectedFlashcardIds([]);
    setFolderActionMessage(`${cardsToMove.length} card${cardsToMove.length === 1 ? '' : 's'} moved to ${folder ? `“${folder.name}”` : 'Unfiled cards'}.`);
  };
  const toggleFlashcardSelection = (id: string) => {
    const card = customFlashcards.find(item => item.id === id);
    const selectedCard = customFlashcards.find(item => selectedFlashcardIds.includes(item.id));
    if (card && selectedCard && card.track !== selectedCard.track && !selectedFlashcardIds.includes(id)) { setFolderActionMessage('Select cards from one exam library at a time so they can stay in the right folder.'); return; }
    setSelectedFlashcardIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
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
    try { window.localStorage.removeItem(accountKey); } catch {}
    setAccountUser(null); setCloudReady(false); setCloudStatus('local'); setAuthUnavailable(false); navigate('landing');
  };

  const openAccount = (nextMode: 'signin' | 'signup' = 'signin') => { setAccountMode(nextMode); setAccountError(''); setShowPassword(false); setView('account'); };
  const navigate = (next: View) => {
    if (!accountUser && next !== 'landing' && next !== 'account') { openAccount('signin'); return; }
    setView(next); setSelected([]); setRevealed(false);
  };
  const closePepTalk = () => { setPepTalk(null); try { window.localStorage.setItem(pepTalkKey, 'seen'); } catch {} };
  const openTrack = (track: StudyTrack) => { setResourceTrack(track); setView('resources'); };
  const chooseDomain = (nextDomain: LibraryDomain) => { setDomain(nextDomain); setTopic('All topics'); setMode('Fresh in selection'); setView('study'); startQuestion(examTrack, nextDomain, 'All topics', 'Fresh in selection', activeQuestionSet); };
  const resumeSession = () => {
    if (!savedSession) return;
    const validTrack = savedSession.track === 'PNLE' || savedSession.track === 'USRN' ? savedSession.track : 'SNLE';
    const validDomain = savedSession.current.track === validTrack ? savedSession.domain : 'All domains';
    setExamTrack(validTrack); if (validTrack === 'SNLE') setSnleQuestionSet((savedSession.questionSet as SnleQuestionSetId) || 'nurse-quest-originals'); if (validTrack === 'USRN') setUsrnQuestionSet((savedSession.questionSet as UsrnQuestionSetId) || 'nurse-quest-originals'); setDomain(validDomain); setTopic(savedSession.topic); setMode(savedSession.mode); setCurrent(savedSession.current); setSelected(savedSession.selected); setRevealed(savedSession.revealed); setView('study');
  };
  const correctIndices = current.correctIndices || [current.correctIndex];
  const answerSubmitted = Boolean(progress[current.id]);
  const selectedCorrect = selected.length === correctIndices.length && selected.every(index => correctIndices.includes(index));
  const showRationale = selectedCorrect || revealed;
  const flashcards = activeQuestions.filter(question => question.variantNumber === 0 && (domain === 'All domains' || question.domain === domain));
  const customCardsForTrack = customFlashcards.filter(card => card.track === examTrack);
  const currentTrackFolders = flashcardFolders.filter(folder => folder.track === examTrack).sort((left, right) => left.name.localeCompare(right.name));
  const dueCustomCards = customCardsForTrack.filter(card => new Date(card.dueAt).getTime() <= Date.now());
  const allDueCustomCards = customFlashcards.filter(card => new Date(card.dueAt).getTime() <= Date.now());
  const flashcardPool = (nextMode = flashcardMode): Array<Question | CustomFlashcard> => nextMode === 'custom' ? (allDueCustomCards.length ? allDueCustomCards : customFlashcards) : flashcards;
  const startFlashcardRound = (nextMode: 'clinical' | 'custom') => router.push(nextMode === 'custom' ? '/flashcards/deck' : '/flashcards/clinical-deck');
  const nextFlashcard = () => {
    const pool = flashcardPool();
    const options = pool.filter(card => card.id !== currentFlashcard?.id);
    if (pool.length) { setCurrentFlashcard(randomItem(options.length ? options : pool)); setFlipped(new Set()); }
  };
  const level = Math.floor(player.xp / 100) + 1;
  const nextReward = rewards.find(reward => !player.unlocked.includes(reward.id));
  const trackLabel = examTrack === 'SNLE' ? 'SNLE · Saudi Arabia' : examTrack === 'PNLE' ? 'PNLE · Philippines' : 'USRN · NCLEX-RN 2026';
  const snleSetLabel = snleQuestionSets.find(set => set.id === snleQuestionSet)?.label || 'Nurse Quest originals';
  const usrnSetLabel = usrnQuestionSets.find(set => set.id === usrnQuestionSet)?.label || 'Nurse Quest originals';
  const openNewRound = () => examTrack === 'SNLE' ? router.push('/practice/snle') : examTrack === 'USRN' ? router.push('/practice/nclex') : selectTrack(examTrack, true);
  const completedQuestions = completedRound ? roundQuestions(completedRound.track, completedRound.domain, completedRound.topic, completedRound.mode, completedRound.questionSet) : [];
  const completedRecords = completedQuestions.map(question => progress[question.id]).filter((record): record is StudyRecord => Boolean(record));
  const completedCorrect = completedRecords.filter(record => record.correct).length;
  const completedAccuracy = completedRecords.length ? Math.round(completedCorrect / completedRecords.length * 100) : 0;
  const completedLabel = completedRound?.track === 'SNLE' ? snleQuestionSets.find(set => set.id === completedRound.questionSet)?.label || 'Nurse Quest originals' : completedRound?.track === 'USRN' ? usrnQuestionSets.find(set => set.id === completedRound.questionSet)?.label || 'Nurse Quest originals' : 'PNLE question library';
  const continueCompletedRound = (nextMode: Mode) => {
    if (!completedRound) return;
    setMode(nextMode); setView('study'); startQuestion(completedRound.track, completedRound.domain, completedRound.topic, nextMode, completedRound.questionSet);
  };
  const renderCustomFlashcard = (card: CustomFlashcard) => {
    const cardFolders = flashcardFolders.filter(folder => folder.track === card.track).sort((left, right) => left.name.localeCompare(right.name));
    return <article className="flashcard saved-flashcard" key={card.id}>
      <div className="flashcard-card-tools"><label className="card-select"><input type="checkbox" checked={selectedFlashcardIds.includes(card.id)} onChange={() => toggleFlashcardSelection(card.id)} aria-label={`Select ${card.front}`} /><span>Select</span></label><label className="card-folder-select">Folder<select aria-label={`Move ${card.front} to a folder`} value={card.folderId || ''} onChange={event => moveCustomFlashcards([card.id], event.target.value)}><option value="">Unfiled cards</option>{cardFolders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label></div>
      <span className="front">My {card.track} card</span><h3>{card.front}</h3><p>{card.back}</p><button className="reset" onClick={() => deleteCustomFlashcard(card.id)}>Delete card</button>
    </article>;
  };

  const header = (active: View) => <header className="nav">
    <button className="brand" onClick={() => router.push(accountUser ? '/overview' : '/')} aria-label="Nurse Quest home"><span className="mark">N</span> Nurse Quest</button>
    {!accountUser ? <div className="nav-actions"><button className="nav-link" onClick={() => openAccount('signin')}>Sign in</button><button className="primary nav-cta" onClick={() => openAccount('signup')}>Create account</button></div> : <div className="nav-actions">
      <button className={`nav-link ${active === 'home' ? 'active' : ''}`} onClick={() => router.push('/overview')}>Overview</button>
      <button className={`nav-link ${active === 'study' || active === 'practiceSetup' || active === 'snleSetSetup' || active === 'usrnSetSetup' ? 'active' : ''}`} onClick={() => router.push('/practice')}>Practice</button>
      <button className={`nav-link ${active === 'flashcards' ? 'active' : ''}`} onClick={() => router.push('/flashcards')}>Flashcards</button>
      <button className={`nav-link ${active === 'rewards' ? 'active' : ''}`} onClick={() => router.push('/rewards')}>Rewards</button>
      <button className={`nav-link ${active === 'resources' ? 'active' : ''}`} onClick={() => router.push('/library')}>Library</button>
      <button className={`nav-link ${active === 'account' ? 'active' : ''}`} onClick={() => router.push('/account')}>Account</button>
    </div>}
  </header>;

  if (!authChecked) return <main className="shell"><section className="auth-loading" aria-live="polite"><span className="mark">N</span><p>Opening your study space…</p></section></main>;

  if (authUnavailable) return <main className="shell"><section className="auth-loading" aria-live="polite"><span className="mark">N</span><p>We could not reach your study space just now.</p><button className="primary" type="button" onClick={() => void loadCloudAccount()}>Try again</button></section></main>;

  if (!accountUser && view === 'landing') return <main className="shell landing-shell">{header('landing')}<section className="landing-hero"><div className="landing-copy"><p className="eyebrow">Nursing exam practice, made personal</p><h1>Your calm corner<br />for the next exam.</h1><p>Original SNLE, PNLE, and USRN practice, flashcards, focused rescue rounds, and progress that follows you from one study session to the next.</p><div className="hero-buttons"><button className="primary" onClick={() => openAccount('signup')}>Create your free account <span aria-hidden="true">→</span></button><button className="secondary" onClick={() => openAccount('signin')}>I already have an account</button></div><p className="landing-note">Your study history stays private to your account.</p></div><div className="landing-preview" aria-label="A preview of the Nurse Quest study experience"><div className="preview-glow" /><p className="eyebrow">Your next session</p><div className="preview-question"><span>SNLE · Fundamentals</span><h2>One clear question at a time.</h2><div><i /><i /><i /><i /></div></div><div className="preview-stats"><span>✦ Weak spots rescue</span><span>☁ Progress saved</span></div></div></section><section className="landing-benefits"><article><span>🧠</span><h2>Practice with purpose</h2><p>Choose a question library, a domain, or a focused round whenever you sit down.</p></article><article><span>🗂️</span><h2>Make it yours</h2><p>Build private flashcards from your own notes and review them on your schedule.</p></article><article><span>↗</span><h2>Pick up anywhere</h2><p>Your questions, rewards, cards, and current round are kept with your account.</p></article></section></main>;

  if (view === 'account' || !accountUser) return <main className="shell">{header('account')}<section className="custom-flashcard-panel" style={{ marginTop: 0 }}>
    {accountUser ? <><div><p className="eyebrow">Cloud study space</p><h1 className="page-title">Hi, {accountUser.name || 'learner'}.</h1><p>Your flashcards, progress, rewards, and saved round are linked to this account.</p><p className="source-note">Sync status: <b>{cloudStatus === 'saved' ? 'Saved to your account' : cloudStatus === 'syncing' ? 'Saving…' : cloudStatus === 'pending' ? 'Saved on this device; waiting to sync' : 'Using this device only'}</b></p></div><div className="custom-flashcard-form"><p><b>{accountUser.email}</b></p><button className="primary" type="button" onClick={() => void syncCloud()} disabled={cloudStatus === 'syncing'}>Sync now</button><button className="secondary" type="button" onClick={() => void signOut()}>Sign out</button></div></> : <><div><p className="eyebrow">Your private study space</p><h1 className="page-title">Come in.<br />Your progress is here.</h1><p>{accountMode === 'signin' ? 'Sign in to continue your questions, flashcards, rewards, and rescue rounds.' : 'Create your account once, then come back to the same progress on any device.'}</p><ul className="account-trust"><li>Private progress and flashcards</li><li>Secure, signed-in sessions</li><li>No Google account required</li></ul></div><form className="custom-flashcard-form account-form" onSubmit={submitAccount}>
      <div className="track-toggle"><button type="button" className={accountMode === 'signin' ? 'selected' : ''} onClick={() => { setAccountMode('signin'); setAccountError(''); }}>Sign in</button><button type="button" className={accountMode === 'signup' ? 'selected' : ''} onClick={() => { setAccountMode('signup'); setAccountError(''); }}>Create account</button></div>
      {accountMode === 'signup' && <><label htmlFor="account-name">First name</label><input id="account-name" name="name" required minLength={2} maxLength={80} autoComplete="given-name" placeholder="How should we call you?" /></>}
      <label htmlFor="account-email">Email address</label><input id="account-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(accountError)} aria-describedby={accountError ? 'account-error' : undefined} />
      <label htmlFor="account-password">Password <span>At least 12 characters</span></label><div className="password-field"><input id="account-password" name="password" type={showPassword ? 'text' : 'password'} required minLength={12} maxLength={128} autoComplete={accountMode === 'signin' ? 'current-password' : 'new-password'} placeholder={accountMode === 'signin' ? 'Your password' : 'Create a strong password'} aria-invalid={Boolean(accountError)} aria-describedby={accountError ? 'account-error' : undefined} /><button type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div>
      <div className="custom-form-foot"><small>{accountMode === 'signin' ? 'Welcome back — your learning space is waiting.' : 'Your password is never stored in plain text.'}</small><button className="primary" type="submit" disabled={accountLoading}>{accountLoading ? 'Please wait…' : accountMode === 'signin' ? 'Continue →' : 'Create my account →'}</button></div>{accountError && <p id="account-error" className="custom-card-error" role="alert">{accountError}</p>}
    </form></>}
  </section></main>;

  if (view === 'results' && completedRound) return <main className="shell">{header('results')}<section className="results-panel" style={{ marginTop: 0 }}><p className="eyebrow">Round complete · {completedLabel}</p><h1 className="page-title">You finished<br />this set.</h1><p className="hero-copy">Your score and every answered question are saved to your account. Use the next round to reinforce the areas that need another look.</p><div className="results-score"><strong>{completedAccuracy}%</strong><span>{completedCorrect} correct out of {completedQuestions.length}</span></div><div className="results-breakdown">{[...new Set(completedQuestions.map(question => question.domain))].map(resultDomain => { const items = completedQuestions.filter(question => question.domain === resultDomain); const correct = items.filter(question => progress[question.id]?.correct).length; return <article key={resultDomain}><span>{resultDomain}</span><b>{correct}/{items.length}</b></article>; })}</div><div className="results-actions"><button className="primary" onClick={() => continueCompletedRound('Review incorrect')}>Review incorrect →</button><button className="secondary" onClick={() => continueCompletedRound('Weak spots rescue')}>Weak Spots Rescue</button><button className="secondary" onClick={() => navigate('home')}>Back to overview</button></div><p className="source-note">This set will remain marked as complete. Its progress is separate from your other exam libraries and question sets.</p></section></main>;

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
      const remaining = customFlashcards.filter(card => card.id !== currentFlashcard.id);
      if (remaining.length) { setCurrentFlashcard(randomItem(remaining)); setFlipped(new Set()); } else { router.push('/flashcards'); }
    };
    return <main className="shell">{header('flashcards')}<section className="flashcard-study" style={{ marginTop: 0 }}><button className="back-link" onClick={() => router.push('/flashcards')}>← Back to flashcards</button><p className="eyebrow">{customCard ? 'My complete deck' : `${trackLabel} · clinical anchors`}</p><h1 className="page-title">One calm card<br />at a time.</h1><p className="flashcard-study-copy">{customCard ? 'Say the answer first, then flip it. Rate it honestly and let the little deck work for you.' : 'A fresh clinical anchor, chosen at random. Think first, then tap to reveal.'}</p><article className="single-flashcard"><button type="button" className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setFlipped(previous => { const next = new Set(previous); next.has(currentFlashcard.id) ? next.delete(currentFlashcard.id) : next.add(currentFlashcard.id); return next; })}><span className="front">{customCard ? `My ${personalCard.track} card` : clinicalCard.topic}</span><h2>{customCard ? personalCard.front : clinicalCard.stem}</h2><p className="front">Tap to reveal</p><div className="back"><span className="back-label">{customCard ? 'Your answer / note' : 'Best response'}</span><h2>{customCard ? personalCard.back : clinicalCard.choices[clinicalCard.correctIndex]}</h2><p>{customCard ? (personalCard.reviewCount ? `Reviewed ${personalCard.reviewCount} time${personalCard.reviewCount === 1 ? '' : 's'}.` : 'A fresh card—nice one.') : clinicalCard.rationale}</p></div></button>{isFlipped && customCard && <div className="single-flashcard-actions"><button className="secondary" type="button" onClick={() => { reviewCustomFlashcard(currentFlashcard.id, false); nextFlashcard(); }}>Again · 10 min</button><button className="primary" type="button" onClick={() => { reviewCustomFlashcard(currentFlashcard.id, true); nextFlashcard(); }}>Got it · {nextInterval} day{nextInterval === 1 ? '' : 's'}</button></div>}<div className="single-flashcard-footer"><button className="secondary" type="button" onClick={nextFlashcard}>Next random card →</button>{customCard && <button className="reset" type="button" onClick={removeCurrentCard}>Delete this card</button>}</div></article></section></main>;
  }

  if (view === 'flashcardStudy') return <main className="shell"><section className="auth-loading"><span className="mark">N</span><p>Opening your deck…</p></section></main>;

  if (view === 'flashcardList') {
    const selectedCards = customFlashcards.filter(card => selectedFlashcardIds.includes(card.id));
    const selectedTrack = selectedCards.length && selectedCards.every(card => card.track === selectedCards[0].track) ? selectedCards[0].track : null;
    const folderTargetTrack = selectedTrack || examTrack;
    const targetTrackFolders = flashcardFolders.filter(folder => folder.track === folderTargetTrack).sort((left, right) => left.name.localeCompare(right.name));
    const targetTrackCards = customFlashcards.filter(card => card.track === folderTargetTrack);
    const eligibleFolders = selectedTrack ? flashcardFolders.filter(folder => folder.track === selectedTrack).sort((left, right) => left.name.localeCompare(right.name)) : [];
    const unfiledCards = customFlashcards.filter(card => !card.folderId || !flashcardFolders.some(folder => folder.id === card.folderId));
    return <main className="shell">{header('flashcards')}<section className="section" style={{ marginTop: 0 }}>
      <button className="back-link" onClick={() => router.push('/flashcards')}>← Back to flashcards</button><p className="eyebrow">My complete deck</p><h1 className="page-title">Your saved<br />flashcards.</h1>
      <p className="hero-copy">{customFlashcards.length ? `${customFlashcards.length} private card${customFlashcards.length === 1 ? '' : 's'} saved across your exam libraries.` : 'No cards yet—make your first one whenever a note is worth keeping.'}</p>
      <section className="folder-manager deck-folder-manager"><div className="section-head"><div><p className="eyebrow">A place for every topic</p><h2>Organize with folders</h2></div><p>Create folders for a subject, a weak spot, or a study week.</p></div><p className="folder-track-note">{selectedTrack ? `Your ${selectedCards.length} selected card${selectedCards.length === 1 ? '' : 's'} will be organized in the ${selectedTrack} library.` : `Folders stay in their exam library. Create a ${folderTargetTrack} folder, or select cards to organize their library.`}</p><form className="folder-create-form" onSubmit={event => addFlashcardFolder(event, folderTargetTrack)}><label htmlFor="new-folder-name">New {folderTargetTrack} folder</label><div><input id="new-folder-name" value={newFolderName} onChange={event => setNewFolderName(event.target.value)} maxLength={60} placeholder="e.g. Pharmacology essentials" /><button className="secondary" type="submit">Create folder</button></div>{folderError && <p className="custom-card-error" role="alert">{folderError}</p>}</form>{targetTrackFolders.length > 0 && <div className="folder-chip-list">{targetTrackFolders.map(folder => <span key={folder.id}>📁 {folder.name} <b>{targetTrackCards.filter(card => card.folderId === folder.id).length}</b></span>)}</div>}{folderActionMessage && <p className="folder-action-message" role="status">{folderActionMessage}</p>}</section>
      {customFlashcards.length > 0 && <><button className="primary" onClick={() => router.push('/flashcards/deck')}>Start my random deck →</button><div className="flashcard-bulk-actions" aria-label="Bulk folder actions"><span>{selectedCards.length ? `${selectedCards.length} selected` : 'Select cards to sort them'}</span><select aria-label="Move selected cards to a folder" defaultValue="" disabled={!selectedCards.length || !selectedTrack} onChange={event => { if (event.target.value) moveCustomFlashcards(selectedFlashcardIds, event.target.value === '__unfiled__' ? '' : event.target.value); event.currentTarget.value = ''; }}><option value="">Move selected to…</option><option value="__unfiled__">Unfiled cards</option>{eligibleFolders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select><button className="secondary" type="button" disabled={!selectedCards.length} onClick={() => moveCustomFlashcards(selectedFlashcardIds, '')}>Unfile selected</button></div></>}
      {flashcardFolders.length > 0 && <div className="folder-card-groups">{[...flashcardFolders].sort((left, right) => left.name.localeCompare(right.name)).map(folder => { const cards = customFlashcards.filter(card => card.folderId === folder.id); return <section className="folder-card-group" key={folder.id}><div className="folder-card-heading"><div><p className="eyebrow">{folder.track} folder</p><h2>📁 {folder.name}</h2></div><span>{cards.length} card{cards.length === 1 ? '' : 's'}</span></div>{cards.length ? <div className="flash-grid">{cards.map(renderCustomFlashcard)}</div> : <p className="empty">This folder is ready for its first card.</p>}</section>; })}</div>}
      {unfiledCards.length > 0 && <section className="folder-card-group unfiled-card-group"><div className="folder-card-heading"><div><p className="eyebrow">No folder yet</p><h2>Unfiled cards</h2></div><span>{unfiledCards.length} card{unfiledCards.length === 1 ? '' : 's'}</span></div><div className="flash-grid">{unfiledCards.map(renderCustomFlashcard)}</div></section>}
    </section></main>;
  }

  if (view === 'flashcards') return <main className="shell">{header('flashcards')}{flashcardSuccess && <aside className="celebration-backdrop" role="dialog" aria-label="Flashcard created"><div className="celebration-card"><span>📝</span><p className="eyebrow">Flashcard created</p><h2>Saved to your deck.</h2><p>{flashcardSuccess}</p><div className="hero-buttons"><button className="primary" onClick={() => router.push('/flashcards/my-deck')}>View my deck</button><button className="secondary" onClick={() => setFlashcardSuccess(null)}>Keep creating</button></div></div></aside>}<section className="custom-flashcard-panel" style={{ marginTop: 0 }}>
    <div><p className="eyebrow">Your own little deck · {trackLabel}</p><h1 className="page-title">Make it yours,<br />one card at a time.</h1><p>Turn tricky notes, mnemonics, and “ohhh, that’s why” moments into private cards for this library.</p>{accountUser && <p className="source-note">Cloud sync: <b>{cloudStatus === 'saved' ? 'saved' : cloudStatus === 'syncing' ? 'saving…' : 'pending'}</b></p>}</div>
    <form className="custom-flashcard-form" onSubmit={addCustomFlashcard}>
      <label htmlFor="custom-card-front">Front of card <span>Question or cue</span></label><textarea id="custom-card-front" value={customFront} onChange={event => setCustomFront(event.target.value)} maxLength={500} placeholder="e.g. What is the priority before giving a new medication?" />
      <label htmlFor="custom-card-back">Back of card <span>Answer, explanation, or memory trick</span></label><textarea id="custom-card-back" value={customBack} onChange={event => setCustomBack(event.target.value)} maxLength={500} placeholder="e.g. Check the prescription, allergies, and patient identity first." />
      <label htmlFor="custom-card-folder">Folder <span>Optional—leave unfiled or choose a folder</span></label><select id="custom-card-folder" value={currentTrackFolders.some(folder => folder.id === customFolderId) ? customFolderId : ''} onChange={event => setCustomFolderId(event.target.value)}><option value="">Unfiled cards</option>{currentTrackFolders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select>
      <div className="custom-form-foot"><small>Stays privately in this browser · {customFront.length + customBack.length}/1000</small><button className="primary" type="submit">Add to my {examTrack} deck →</button></div>
      {customFlashcardError && <p className="custom-card-error" role="alert">{customFlashcardError}</p>}
    </form>
  </section><section className="section flashcard-launch-section">
    <div className="section-head"><div><p className="eyebrow">Ready when she is</p><h2>Choose a little deck</h2></div><button className="secondary" onClick={() => router.push('/flashcards/my-deck')}>View my deck</button></div>
    <div className="flashcard-launch-grid"><article><span>📝</span><p className="eyebrow">My {examTrack} cards</p><h3>Her own notes, made memorable.</h3><p>{customCardsForTrack.length ? `${dueCustomCards.length} due now · ${customCardsForTrack.length} saved` : 'Make a card above, then come back for a mini review.'}</p><button className="primary" disabled={!customCardsForTrack.length} onClick={() => startFlashcardRound('custom')}>Start my random deck →</button></article><article><span>✨</span><p className="eyebrow">Clinical anchors</p><h3>Practice built-in nursing cards.</h3><p>Choose a domain if she wants, then get one randomized card at a time.</p><div className="field"><label htmlFor="flash-domain">Focus domain</label><select id="flash-domain" value={domain} onChange={event => setDomain(event.target.value as LibraryDomain | 'All domains')}><option>All domains</option>{activeDomains.map(item => <option key={item.name}>{item.name}</option>)}</select></div><button className="primary" onClick={() => startFlashcardRound('clinical')}>Start random clinical card →</button></article></div>
  </section></main>;

  if (view === 'snleSetSetup') return <main className="shell">{header('snleSetSetup')}<section className="section practice-setup" style={{ marginTop: 0 }}>
    <button className="back-link" onClick={() => navigate('practiceSetup')}>← Back to exam choices</button><p className="eyebrow">SNLE practice set</p><h1 className="page-title">Which SNLE set<br />are we opening?</h1><p className="hero-copy">Each set opens the same four-choice practice flow, with its own question progress. Every item in the app is an original teaching scenario.</p>
    <div className="practice-library-grid">{snleQuestionSets.map(set => <button className="practice-library-card snle-card" key={set.id} onClick={() => openSnleQuestionSet(set.id)}><span>🇸🇦</span><small>SNLE QUESTION SET</small><h2>{set.label}</h2><p>{set.description}</p><b>Open this set →</b></button>)}</div>
  </section></main>;

  if (view === 'usrnSetSetup') return <main className="shell">{header('usrnSetSetup')}<section className="section practice-setup" style={{ marginTop: 0 }}>
    <button className="back-link" onClick={() => router.push('/practice')}>← Back to exam choices</button><p className="eyebrow">NCLEX-RN practice set</p><h1 className="page-title">Which NCLEX set<br />are we opening?</h1><p className="hero-copy">Each challenge exam has its own saved progress and score. Exam 1 includes select-all-that-apply questions.</p>
    <div className="practice-library-grid">{usrnQuestionSets.map(set => { const stats = usrnSetStats(set.id); return <button className="practice-library-card usrn-card" key={set.id} onClick={() => openUsrnQuestionSet(set.id)}><span>🇺🇸</span><small>NCLEX-RN QUESTION SET</small><h2>{set.label}</h2><p>{set.description}</p><b>{stats.done}/{stats.total} answered · Open this set →</b></button>; })}</div>
  </section></main>;

  if (view === 'practiceSetup') return <main className="shell">{header('practiceSetup')}<section className="section practice-setup" style={{ marginTop: 0 }}>
    <p className="eyebrow">Practice first step</p><h1 className="page-title">Which exam are we<br />playing today?</h1><p className="hero-copy">Pick one library. Its first question will open right away, with only that exam’s progress and rewards.</p>
    <div className="practice-library-grid"><button className="practice-library-card snle-card" onClick={() => router.push('/practice/snle')}><span>🇸🇦</span><small>SAUDI ARABIA</small><h2>SNLE</h2><p>Choose from five practice sets</p><b>Choose an SNLE set →</b></button><button className="practice-library-card pnle-card" onClick={() => selectTrack('PNLE', true)}><span>🇵🇭</span><small>PHILIPPINES</small><h2>PNLE</h2><p>20 original core questions</p><b>Start PNLE practice →</b></button><button className="practice-library-card usrn-card" onClick={() => router.push('/practice/nclex')}><span>🇺🇸</span><small>UNITED STATES</small><h2>USRN 2026</h2><p>Choose an NCLEX-RN practice set</p><b>Choose an NCLEX-RN set →</b></button></div>
  </section></main>;

  if (view === 'study') return <main className="shell">{header('study')}<div className="study-layout">
    <aside className="study-controls"><div className="study-controls-head"><h2>Shape your set</h2><button className="mobile-control-toggle" aria-expanded={controlsOpen} aria-controls="study-set-controls" onClick={() => setControlsOpen(open => !open)}>{controlsOpen ? 'Done' : 'Filters'} <span aria-hidden="true">{controlsOpen ? '↑' : '☰'}</span></button></div>
      <div className={`control-body ${controlsOpen ? 'open' : ''}`} id="study-set-controls"><div className="field"><label htmlFor="exam-track">Question library</label><select id="exam-track" value={examTrack} onChange={event => selectTrack(event.target.value as StudyTrack, true)}><option value="SNLE">SNLE · Saudi Arabia</option><option value="PNLE">PNLE · Philippines</option><option value="USRN">USRN · NCLEX-RN 2026</option></select></div>
      {examTrack === 'SNLE' && <div className="field"><label htmlFor="snle-question-set">SNLE practice set</label><select id="snle-question-set" value={snleQuestionSet} onChange={event => selectSnleQuestionSet(event.target.value as SnleQuestionSetId, true)}>{snleQuestionSets.map(set => <option key={set.id} value={set.id}>{set.label}</option>)}</select></div>}
      {examTrack === 'USRN' && <div className="field"><label htmlFor="usrn-question-set">NCLEX-RN practice set</label><select id="usrn-question-set" value={usrnQuestionSet} onChange={event => selectUsrnQuestionSet(event.target.value as UsrnQuestionSetId, true)}>{usrnQuestionSets.map(set => <option key={set.id} value={set.id}>{set.label}</option>)}</select></div>}
      <p className="library-rule">One library is active at a time. Your countries never mix.</p>
      <div className="field"><label htmlFor="domain">Domain</label><select id="domain" value={domain} onChange={event => { const next = event.target.value as LibraryDomain | 'All domains'; setDomain(next); setTopic('All topics'); setMode('Fresh in selection'); }}><option>All domains</option>{activeDomains.map(item => <option key={item.name}>{item.name}</option>)}</select></div>
      <div className="field"><label htmlFor="topic">Topic</label><select id="topic" value={topic} onChange={event => { setTopic(event.target.value); setMode('Fresh in selection'); }}><option>All topics</option>{topics.map(item => <option key={item}>{item}</option>)}</select></div>
      <div className="field"><label htmlFor="mode">Mode</label><select id="mode" value={mode} onChange={event => setMode(event.target.value as Mode)}><option>Random topics</option><option>Fresh in selection</option><option>All scenario forms</option><option>Review incorrect</option><option>Weak spots rescue</option></select></div>
      <p className="filter-note">Normal modes use each original core question once before a repeat. “All scenario forms” intentionally includes alternate situations for the same clinical concept. “Weak spots rescue” brings back missed, guessed, and unsure answers. Your filter choices apply after you answer this question.</p>
      <div className="progress-caption"><span>{summary.answered} answered</span><span>{activeQuestions.length} {examTrack} questions</span></div><div className="bar"><i style={{ width: `${percent}%` }} /></div></div>
    </aside>
    <section className="question-card"><div className="question-meta"><span className="tag">{current.track} · {current.domain}</span>{current.track === 'SNLE' && <span className="difficulty">{snleSetLabel}</span>}{current.track === 'USRN' && <span className="difficulty">{usrnSetLabel}</span>}{current.correctIndices?.length && <span className="difficulty">SELECT ALL THAT APPLY</span>}<span className="difficulty">{current.isAlternateForm ? 'ALTERNATE FORM' : `SCENARIO ${current.variantNumber + 1}`}</span></div>
      <h1 className="question-title">{current.stem}</h1>{current.correctIndices?.length && <p className="filter-note">Select every answer you believe is correct, then check your answer.</p>}<div className="answer-list">{current.choices.map((choice, index) => { const chosen = selected.includes(index); const wrong = answerSubmitted && chosen && !correctIndices.includes(index); const correct = answerSubmitted && correctIndices.includes(index) && showRationale; return <button aria-pressed={chosen} className={`answer-btn ${chosen && !answerSubmitted ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} disabled={answerSubmitted} key={choice} onClick={() => toggleAnswer(index)}><span className="letter">{letters[index]}</span><span>{choice}</span></button>; })}</div>
      {answerSubmitted && <div className={`feedback ${selectedCorrect ? 'good' : 'bad'}`}><h3>{selectedCorrect ? 'Correct — keep the clinical priority.' : 'Not quite — pause before moving on.'}</h3>{showRationale ? <><p className="rationale"><strong>Rationale:</strong> {current.rationale}</p><p className="question-reference">Suggested study reference: <a href={domainReferences[current.domain].href} target="_blank" rel="noreferrer">{domainReferences[current.domain].title} ↗</a></p></> : <p>Select <strong>Reveal answer</strong> to see the correct option and rationale, or move to a new question.</p>}<div className="confidence-check"><span>How did that feel?</span><button className={progress[current.id]?.confidence === 'confident' ? 'selected' : ''} type="button" onClick={() => saveConfidence('confident')}>Confident</button><button className={progress[current.id]?.confidence === 'unsure' ? 'selected' : ''} type="button" onClick={() => saveConfidence('unsure')}>Unsure</button><button className={progress[current.id]?.confidence === 'guessed' ? 'selected' : ''} type="button" onClick={() => saveConfidence('guessed')}>Guessed</button></div></div>}
      <div className="study-actions"><p className="muted">{!answerSubmitted ? current.correctIndices?.length ? <>Choose all that apply, then check your answer.</> : <>Pick an answer to unlock the next question.</> : <>Your answer saves {accountUser ? 'to your account and this browser' : 'privately in this browser'}. Mark anything uncertain, then use <strong>Weak spots rescue</strong> for a focused second pass.</>}</p><div className="hero-buttons">{!answerSubmitted && current.correctIndices?.length && <button className="primary" disabled={!selected.length} onClick={() => submitAnswer()}>Check answer</button>}{answerSubmitted && !selectedCorrect && !revealed && <button className="secondary" onClick={() => setRevealed(true)}>Reveal answer</button>}{answerSubmitted && <button className="primary" onClick={() => startQuestion()}>Next question →</button>}</div></div>
    </section>
  </div>{celebration && <div className="celebration-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title"><article className="celebration-card"><span>{celebration.emoji}</span><p className="eyebrow">Reward unlocked · {current.track}</p><h2 id="reward-title">{celebration.title}</h2><p>{celebration.message}</p><div className="reward-score"><b>Level {level}</b><span>{player.xp} XP · {player.bestStreak} best streak</span></div><p className="share-note">Screenshot this little win and share it with your mentor or boss—no patient details, just your progress.</p><button className="primary" onClick={() => setCelebration(null)}>Keep playing →</button></article></div>}</main>;

  return <main className="shell">{header('home')}<section className="hero"><div><p className="eyebrow">Your little study corner · pick an exam</p><h1>One question.<br />One glow-up.</h1><p className="hero-copy">First choose your question library. Then take friendly clinical challenges, collect XP, and build confidence one calm decision at a time.</p>
    <div className="library-picker" aria-label="Choose question library"><button className={`library-choice ${examTrack === 'SNLE' ? 'selected' : ''}`} onClick={() => selectTrack('SNLE')}><span>🇸🇦</span><b>SNLE · Saudi Arabia</b><small>60 original core questions</small></button><button className={`library-choice ${examTrack === 'PNLE' ? 'selected' : ''}`} onClick={() => selectTrack('PNLE')}><span>🇵🇭</span><b>PNLE · Philippines</b><small>20 original core questions</small></button><button className={`library-choice ${examTrack === 'USRN' ? 'selected' : ''}`} onClick={() => selectTrack('USRN')}><span>🇺🇸</span><b>USRN · NCLEX-RN 2026</b><small>Original bank + 3 challenge exams</small></button></div>
    <p className="library-rule home-rule">Only one library is active at a time: questions, flashcards, progress, XP, and rewards never mix between exams.</p>
    <div className="hero-buttons"><button className="primary" onClick={openNewRound}>Play a new round <span aria-hidden="true">→</span></button>{savedSession && <button className="secondary" onClick={resumeSession}>Resume my round</button>}<button className="secondary" onClick={() => openTrack(examTrack)}>Open study library</button></div>
  </div><aside className="focus-card game-card"><div className="study-companion"><Image className="study-companion-cat" src="/images/nurse-study-cat.jpg" width={900} height={1350} priority unoptimized alt="A cozy nurse cat studying beside nursing notes" /></div><div className="player-card-copy"><p className="eyebrow">{trackLabel} · player card</p><div className="level-orb">{level}</div><h2>Level {level} learner<br /><em>{player.xp} XP collected</em></h2><div className="mini-progress">{Array.from({ length: 8 }, (_, index) => <span className={index < Math.round((player.xp % 100) / 12.5) ? 'done' : ''} key={index} />)}</div><p>{nextReward ? `${Math.max(0, nextReward.threshold - player.correct)} more correct answer${nextReward.threshold - player.correct === 1 ? '' : 's'} to unlock ${nextReward.emoji} ${nextReward.title}.` : 'Every badge is yours—keep your streak glowing.'}</p></div></aside></section>
  <section className="section"><div className="section-head"><div><p className="eyebrow">{trackLabel} · Pick your lane</p><h2>Practice by blueprint domain</h2></div><p>Tap a domain to start a focused set.</p></div><div className="grid">{activeDomains.map(item => <button className="topic-card" key={item.name} onClick={() => chooseDomain(item.name)}><span className="count">{item.target} TARGET · {domainStats(item.name).total} FORMS</span><h3>{item.name}</h3><p>{item.summary}</p></button>)}</div></section>
  <section className="section history"><article className="panel"><h3>Coverage, at a glance</h3>{activeDomains.map(item => { const stat = domainStats(item.name); const complete = stat.total ? Math.round(stat.done / stat.total * 100) : 0; return <div className="progress-row" key={item.name}><span>{item.name}</span><div className="bar"><i style={{ width: `${complete}%` }} /></div><b>{complete}%</b></div>; })}</article><article className="panel"><h3>Study sources for this library</h3><p className="empty">The blueprint guides the mix. Every domain points toward a public official safety, scope, or blueprint reference.</p><div className="source-list">{activeDomains.map(item => <a key={item.name} href={domainReferences[item.name].href} target="_blank" rel="noreferrer"><span>{item.name}</span>{domainReferences[item.name].title} ↗</a>)}</div><p className="source-note">Full official and commercial resource list: <button onClick={() => openTrack(examTrack)}>Study Library</button>.</p></article></section>
  {pepTalk && <aside className="pep-popup" role="dialog" aria-label="A little encouragement"><span>{pepTalk.emoji}</span><div><b>{pepTalk.title}</b><p>{pepTalk.message}</p></div><button onClick={closePepTalk} aria-label="Close encouragement">×</button></aside>}
  </main>;
}
