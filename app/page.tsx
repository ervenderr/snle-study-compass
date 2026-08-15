'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { domainReferences, domainsForTrack, questions, type LibraryDomain, type Question } from '../lib/questions';
import { studyResources, type StudyTrack } from '../lib/resources';

type View = 'home' | 'practiceSetup' | 'study' | 'flashcards' | 'rewards' | 'resources';
type Mode = 'Random topics' | 'Fresh in selection' | 'All scenario forms' | 'Review incorrect';
type StudyRecord = { correct: boolean; selected: number; answeredAt: string; alternate: boolean };
type Progress = Record<string, StudyRecord>;
type SavedSession = { current: Question; track: StudyTrack; domain: LibraryDomain | 'All domains'; topic: string; mode: Mode; selected: number | null; revealed: boolean; savedAt: string };
type Player = { xp: number; streak: number; bestStreak: number; correct: number; unlocked: string[] };
type Players = Record<StudyTrack, Player>;
type Celebration = { title: string; message: string; emoji: string } | null;
type PepTalk = { title: string; message: string; emoji: string } | null;

const storageKey = 'snle-study-compass-progress-v2';
const sessionKey = 'snle-study-compass-session-v1';
const playerKey = 'snle-study-compass-player-v1';
const pepTalkKey = 'nurse-quest-pep-talk-v1';
const letters = ['A', 'B', 'C', 'D'];
const rewards = [
  { id: 'spark', threshold: 1, emoji: '⭐', title: 'First Spark', message: 'One correct answer is a real beginning.' },
  { id: 'steady', threshold: 10, emoji: '🌱', title: 'Steady Starter', message: 'Ten correct answers—your habits are growing.' },
  { id: 'bright', threshold: 25, emoji: '✨', title: 'Bright Mind', message: 'Twenty-five clinical wins unlocked.' },
  { id: 'charger', threshold: 50, emoji: '⚡', title: 'Care Charger', message: 'Fifty correct answers—your revision energy is showing.' },
  { id: 'legend', threshold: 100, emoji: '🏆', title: 'Study Legend', message: 'One hundred correct answers. That is serious momentum.' },
];
const emptyPlayer = (): Player => ({ xp: 0, streak: 0, bestStreak: 0, correct: 0, unlocked: [] });
const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function loadProgress(): Progress { try { return JSON.parse(window.localStorage.getItem(storageKey) || '{}') as Progress; } catch { return {}; } }
function loadSession(): SavedSession | null {
  try {
    const saved = JSON.parse(window.localStorage.getItem(sessionKey) || 'null') as Partial<SavedSession> | null;
    if (!saved?.current?.choices || saved.current.choices.length !== 4 || typeof saved.current.stem !== 'string') return null;
    return { ...saved, track: saved.track === 'PNLE' || saved.track === 'USRN' ? saved.track : 'SNLE', domain: saved.domain || 'All domains' } as SavedSession;
  } catch { return null; }
}
function loadPlayers(): Players {
  try {
    const saved = JSON.parse(window.localStorage.getItem(playerKey) || 'null') as Partial<Players & Player> | null;
    if (saved && 'SNLE' in saved) return { SNLE: saved.SNLE as Player, PNLE: (saved.PNLE as Player) || emptyPlayer(), USRN: (saved.USRN as Player) || emptyPlayer() };
    return { SNLE: (saved && 'xp' in saved ? saved : emptyPlayer()) as Player, PNLE: emptyPlayer(), USRN: emptyPlayer() };
  } catch { return { SNLE: emptyPlayer(), PNLE: emptyPlayer(), USRN: emptyPlayer() }; }
}

function alternateForm(question: Question): Question {
  const frames = ['During a focused clinical handover, ', 'In a comparable but newly presented scenario, ', 'While prioritizing care on a busy shift, ', 'During a safety review with the nursing team, '];
  return { ...question, id: `${question.id}-alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, stem: `${randomItem(frames)}${question.stem.charAt(0).toLowerCase()}${question.stem.slice(1)}`, isAlternateForm: true };
}

export default function StudyCompass() {
  const [view, setView] = useState<View>('home');
  const [examTrack, setExamTrack] = useState<StudyTrack>('SNLE');
  const [domain, setDomain] = useState<LibraryDomain | 'All domains'>('All domains');
  const [topic, setTopic] = useState('All topics');
  const [mode, setMode] = useState<Mode>('Random topics');
  const [progress, setProgress] = useState<Progress>({});
  const [current, setCurrent] = useState<Question>(questions[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [players, setPlayers] = useState<Players>({ SNLE: emptyPlayer(), PNLE: emptyPlayer(), USRN: emptyPlayer() });
  const [celebration, setCelebration] = useState<Celebration>(null);
  const [pepTalk, setPepTalk] = useState<PepTalk>(null);
  const [resourceTrack, setResourceTrack] = useState<StudyTrack>('SNLE');
  const skipInitialSessionWrite = useRef(true);
  const activeQuestions = useMemo(() => questions.filter(question => question.track === examTrack), [examTrack]);
  const activeDomains = useMemo(() => domainsForTrack(examTrack), [examTrack]);
  const player = players[examTrack];

  useEffect(() => {
    setProgress(loadProgress());
    setSavedSession(loadSession());
    setPlayers(loadPlayers());
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded || window.localStorage.getItem(pepTalkKey)) return;
    setPepTalk({ emoji: '💜', title: 'Hey girl, you’ve got this.', message: 'One calm question at a time. Future you is already proud.' });
  }, [storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    if (skipInitialSessionWrite.current) { skipInitialSessionWrite.current = false; return; }
    const nextSession: SavedSession = { current, track: examTrack, domain, topic, mode, selected, revealed, savedAt: new Date().toISOString() };
    try { window.localStorage.setItem(sessionKey, JSON.stringify(nextSession)); } catch {}
    setSavedSession(nextSession);
  }, [current, domain, examTrack, mode, revealed, selected, storageLoaded, topic]);

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

  const pickQuestion = (nextTrack = examTrack, nextDomain = domain, nextTopic = topic, nextMode = mode) => {
    const library = questions.filter(question => question.track === nextTrack);
    const inSelection = library.filter(question => (nextDomain === 'All domains' || question.domain === nextDomain) && (nextTopic === 'All topics' || question.topic === nextTopic));
    const pool = nextMode === 'Random topics' ? library : inSelection;
    if (!pool.length) return library[0];
    if (nextMode === 'Review incorrect') {
      const incorrect = pool.filter(question => progress[question.id] && !progress[question.id].correct);
      if (incorrect.length) return randomItem(incorrect);
    }
    if (nextMode === 'All scenario forms') return randomItem(pool);
    const unseen = pool.filter(question => !progress[question.id] && question.id !== current.id);
    if (unseen.length) return randomItem(unseen);
    return alternateForm(randomItem(pool));
  };
  const startQuestion = (nextTrack = examTrack, nextDomain = domain, nextTopic = topic, nextMode = mode) => {
    setCurrent(pickQuestion(nextTrack, nextDomain, nextTopic, nextMode));
    setSelected(null); setRevealed(false);
  };
  const selectTrack = (track: StudyTrack, start = false) => {
    setExamTrack(track); setDomain('All domains'); setTopic('All topics'); setMode('Random topics'); setFlipped(new Set());
    if (start) { startQuestion(track, 'All domains', 'All topics', 'Random topics'); setView('study'); }
  };
  const saveAnswer = (index: number) => {
    if (selected !== null) return;
    const isCorrect = index === current.correctIndex;
    const nextProgress = { ...progress, [current.id]: { correct: isCorrect, selected: index, answeredAt: new Date().toISOString(), alternate: current.isAlternateForm } };
    setSelected(index); setProgress(nextProgress);
    try { window.localStorage.setItem(storageKey, JSON.stringify(nextProgress)); } catch {}
    setPlayers(previous => {
      const previousTrack = previous[current.track];
      const nextCorrect = previousTrack.correct + (isCorrect ? 1 : 0);
      const nextStreak = isCorrect ? previousTrack.streak + 1 : 0;
      const newlyUnlocked = isCorrect ? rewards.find(reward => nextCorrect >= reward.threshold && !previousTrack.unlocked.includes(reward.id)) : undefined;
      const nextPlayer: Player = { xp: previousTrack.xp + (isCorrect ? 12 + Math.min(nextStreak, 8) : 2), streak: nextStreak, bestStreak: Math.max(previousTrack.bestStreak, nextStreak), correct: nextCorrect, unlocked: newlyUnlocked ? [...previousTrack.unlocked, newlyUnlocked.id] : previousTrack.unlocked };
      const next = { ...previous, [current.track]: nextPlayer };
      try { window.localStorage.setItem(playerKey, JSON.stringify(next)); } catch {}
      if (newlyUnlocked) setCelebration(newlyUnlocked);
      return next;
    });
  };

  const navigate = (next: View) => { setView(next); setSelected(null); setRevealed(false); };
  const closePepTalk = () => { setPepTalk(null); try { window.localStorage.setItem(pepTalkKey, 'seen'); } catch {} };
  const openTrack = (track: StudyTrack) => { setResourceTrack(track); setView('resources'); };
  const chooseDomain = (nextDomain: LibraryDomain) => { setDomain(nextDomain); setTopic('All topics'); setMode('Fresh in selection'); startQuestion(examTrack, nextDomain, 'All topics', 'Fresh in selection'); setView('study'); };
  const resumeSession = () => {
    if (!savedSession) return;
    const validTrack = savedSession.track === 'PNLE' || savedSession.track === 'USRN' ? savedSession.track : 'SNLE';
    const validDomain = savedSession.current.track === validTrack ? savedSession.domain : 'All domains';
    setExamTrack(validTrack); setDomain(validDomain); setTopic(savedSession.topic); setMode(savedSession.mode); setCurrent(savedSession.current); setSelected(savedSession.selected); setRevealed(savedSession.revealed); setView('study');
  };
  const selectedCorrect = selected === current.correctIndex;
  const showRationale = selectedCorrect || revealed;
  const flashcards = activeQuestions.filter(question => question.variantNumber === 0 && (domain === 'All domains' || question.domain === domain));
  const level = Math.floor(player.xp / 100) + 1;
  const nextReward = rewards.find(reward => !player.unlocked.includes(reward.id));
  const trackLabel = examTrack === 'SNLE' ? 'SNLE · Saudi Arabia' : examTrack === 'PNLE' ? 'PNLE · Philippines' : 'USRN · NCLEX-RN 2026';

  const header = (active: View) => <header className="nav">
    <button className="brand" onClick={() => navigate('home')} aria-label="Nurse Quest home"><span className="mark">N</span> Nurse Quest</button>
    <div className="nav-actions">
      <button className={`nav-link ${active === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>Overview</button>
      <button className={`nav-link ${active === 'study' || active === 'practiceSetup' ? 'active' : ''}`} onClick={() => navigate('practiceSetup')}>Practice</button>
      <button className={`nav-link ${active === 'flashcards' ? 'active' : ''}`} onClick={() => navigate('flashcards')}>Flashcards</button>
      <button className={`nav-link ${active === 'rewards' ? 'active' : ''}`} onClick={() => navigate('rewards')}>Rewards</button>
      <button className={`nav-link ${active === 'resources' ? 'active' : ''}`} onClick={() => openTrack(examTrack)}>Library</button>
    </div>
  </header>;

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

  if (view === 'flashcards') return <main className="shell">{header('flashcards')}<section className="section" style={{ marginTop: 0 }}>
    <div className="section-head"><div><p className="eyebrow">{trackLabel} · Fast active recall</p><h2>Flashcards for clinical anchors</h2></div><div className="field" style={{ minWidth: 190, margin: 0 }}><label htmlFor="flash-domain">Focus domain</label><select id="flash-domain" value={domain} onChange={event => setDomain(event.target.value as LibraryDomain | 'All domains')}><option>All domains</option>{activeDomains.map(item => <option key={item.name}>{item.name}</option>)}</select></div></div>
    <p className="card-note">Only {examTrack} cards are shown. Tap a card to reveal the key action and why it matters.</p>
    <div className="flash-grid">{flashcards.map(question => <button className={`flashcard ${flipped.has(question.id) ? 'flipped' : ''}`} key={question.id} onClick={() => setFlipped(previous => { const next = new Set(previous); next.has(question.id) ? next.delete(question.id) : next.add(question.id); return next; })}><span className="front">{question.topic}</span><h3>{question.stem}</h3><p className="front">Tap to reveal</p><div className="back"><span className="back-label">Best response</span><h3>{question.choices[question.correctIndex]}</h3><p>{question.rationale}</p></div></button>)}</div>
  </section></main>;

  if (view === 'practiceSetup') return <main className="shell">{header('practiceSetup')}<section className="section practice-setup" style={{ marginTop: 0 }}>
    <p className="eyebrow">Practice first step</p><h1 className="page-title">Which exam are we<br />playing today?</h1><p className="hero-copy">Pick one library. Its first question will open right away, with only that exam’s progress and rewards.</p>
    <div className="practice-library-grid"><button className="practice-library-card snle-card" onClick={() => selectTrack('SNLE', true)}><span>🇸🇦</span><small>SAUDI ARABIA</small><h2>SNLE</h2><p>320 original scenario forms</p><b>Start SNLE practice →</b></button><button className="practice-library-card pnle-card" onClick={() => selectTrack('PNLE', true)}><span>🇵🇭</span><small>PHILIPPINES</small><h2>PNLE</h2><p>80 original scenario forms</p><b>Start PNLE practice →</b></button><button className="practice-library-card usrn-card" onClick={() => selectTrack('USRN', true)}><span>🇺🇸</span><small>UNITED STATES</small><h2>USRN 2026</h2><p>160 original NCLEX-RN forms</p><b>Start USRN practice →</b></button></div>
  </section></main>;

  if (view === 'study') return <main className="shell">{header('study')}<div className="study-layout">
    <aside className="study-controls"><div className="study-controls-head"><h2>Shape your set</h2><button className="mobile-control-toggle" aria-expanded={controlsOpen} aria-controls="study-set-controls" onClick={() => setControlsOpen(open => !open)}>{controlsOpen ? 'Done' : 'Filters'} <span aria-hidden="true">{controlsOpen ? '↑' : '☰'}</span></button></div>
      <div className={`control-body ${controlsOpen ? 'open' : ''}`} id="study-set-controls"><div className="field"><label htmlFor="exam-track">Question library</label><select id="exam-track" value={examTrack} onChange={event => selectTrack(event.target.value as StudyTrack, true)}><option value="SNLE">SNLE · Saudi Arabia</option><option value="PNLE">PNLE · Philippines</option><option value="USRN">USRN · NCLEX-RN 2026</option></select></div>
      <p className="library-rule">One library is active at a time. Your countries never mix.</p>
      <div className="field"><label htmlFor="domain">Domain</label><select id="domain" value={domain} onChange={event => { const next = event.target.value as LibraryDomain | 'All domains'; setDomain(next); setTopic('All topics'); setMode('Fresh in selection'); }}><option>All domains</option>{activeDomains.map(item => <option key={item.name}>{item.name}</option>)}</select></div>
      <div className="field"><label htmlFor="topic">Topic</label><select id="topic" value={topic} onChange={event => { setTopic(event.target.value); setMode('Fresh in selection'); }}><option>All topics</option>{topics.map(item => <option key={item}>{item}</option>)}</select></div>
      <div className="field"><label htmlFor="mode">Mode</label><select id="mode" value={mode} onChange={event => setMode(event.target.value as Mode)}><option>Random topics</option><option>Fresh in selection</option><option>All scenario forms</option><option>Review incorrect</option></select></div>
      <p className="filter-note">Your filter choices will apply after you answer this question. The next button stays with the question.</p>
      <div className="progress-caption"><span>{summary.answered} answered</span><span>{activeQuestions.length} {examTrack} forms</span></div><div className="bar"><i style={{ width: `${percent}%` }} /></div></div>
    </aside>
    <section className="question-card"><div className="question-meta"><span className="tag">{current.track} · {current.domain}</span><span className="difficulty">{current.isAlternateForm ? 'ALTERNATE FORM' : `SCENARIO ${current.variantNumber + 1}`}</span></div>
      <h1 className="question-title">{current.stem}</h1><div className="answer-list">{current.choices.map((choice, index) => { const wrong = selected !== null && selected === index && index !== current.correctIndex; const correct = selected !== null && index === current.correctIndex && showRationale; return <button className={`answer-btn ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} disabled={selected !== null} key={choice} onClick={() => saveAnswer(index)}><span className="letter">{letters[index]}</span><span>{choice}</span></button>; })}</div>
      {selected !== null && <div className={`feedback ${selectedCorrect ? 'good' : 'bad'}`}><h3>{selectedCorrect ? 'Correct — keep the clinical priority.' : 'Not quite — pause before moving on.'}</h3>{showRationale ? <><p className="rationale"><strong>Rationale:</strong> {current.rationale}</p><p className="question-reference">Suggested study reference: <a href={domainReferences[current.domain].href} target="_blank" rel="noreferrer">{domainReferences[current.domain].title} ↗</a></p></> : <p>Select <strong>Reveal answer</strong> to see the correct option and rationale, or move to a new question.</p>}</div>}
      <div className="study-actions"><p className="muted">{selected === null ? <>Pick an answer to unlock the next question.</> : <>Choose the <strong>one best answer</strong>. Your answer saves privately in this browser.</>}</p><div className="hero-buttons">{selected !== null && !selectedCorrect && !revealed && <button className="secondary" onClick={() => setRevealed(true)}>Reveal answer</button>}{selected !== null && <button className="primary" onClick={() => startQuestion()}>Next question →</button>}</div></div>
    </section>
  </div>{celebration && <div className="celebration-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title"><article className="celebration-card"><span>{celebration.emoji}</span><p className="eyebrow">Reward unlocked · {current.track}</p><h2 id="reward-title">{celebration.title}</h2><p>{celebration.message}</p><div className="reward-score"><b>Level {level}</b><span>{player.xp} XP · {player.bestStreak} best streak</span></div><p className="share-note">Screenshot this little win and share it with your mentor or boss—no patient details, just your progress.</p><button className="primary" onClick={() => setCelebration(null)}>Keep playing →</button></article></div>}</main>;

  return <main className="shell">{header('home')}<section className="hero"><div><p className="eyebrow">Your little study corner · pick an exam</p><h1>One question.<br />One glow-up.</h1><p className="hero-copy">First choose your question library. Then take friendly clinical challenges, collect XP, and build confidence one calm decision at a time.</p>
    <div className="library-picker" aria-label="Choose question library"><button className={`library-choice ${examTrack === 'SNLE' ? 'selected' : ''}`} onClick={() => selectTrack('SNLE')}><span>🇸🇦</span><b>SNLE · Saudi Arabia</b><small>320 original scenario forms</small></button><button className={`library-choice ${examTrack === 'PNLE' ? 'selected' : ''}`} onClick={() => selectTrack('PNLE')}><span>🇵🇭</span><b>PNLE · Philippines</b><small>80 original scenario forms</small></button><button className={`library-choice ${examTrack === 'USRN' ? 'selected' : ''}`} onClick={() => selectTrack('USRN')}><span>🇺🇸</span><b>USRN · NCLEX-RN 2026</b><small>160 original scenario forms</small></button></div>
    <p className="library-rule home-rule">Only one library is active at a time: questions, flashcards, progress, XP, and rewards never mix between exams.</p>
    <div className="hero-buttons"><button className="primary" onClick={() => selectTrack(examTrack, true)}>Play a new round <span aria-hidden="true">→</span></button>{savedSession && <button className="secondary" onClick={resumeSession}>Resume my round</button>}<button className="secondary" onClick={() => openTrack(examTrack)}>Open study library</button></div>
  </div><aside className="focus-card game-card"><Image className="cat-meme" src="https://cataas.com/cat/says/You%20got%20this%20girl?fontSize=28&fontColor=765792&width=900" width={900} height={900} unoptimized alt="A cat meme saying you got this girl" /><div className="player-card-copy"><p className="eyebrow">{trackLabel} · player card</p><div className="level-orb">{level}</div><h2>Level {level} learner<br /><em>{player.xp} XP collected</em></h2><div className="mini-progress">{Array.from({ length: 8 }, (_, index) => <span className={index < Math.round((player.xp % 100) / 12.5) ? 'done' : ''} key={index} />)}</div><p>{nextReward ? `${Math.max(0, nextReward.threshold - player.correct)} more correct answer${nextReward.threshold - player.correct === 1 ? '' : 's'} to unlock ${nextReward.emoji} ${nextReward.title}.` : 'Every badge is yours—keep your streak glowing.'}</p></div></aside></section>
  <section className="section"><div className="section-head"><div><p className="eyebrow">{trackLabel} · Pick your lane</p><h2>Practice by blueprint domain</h2></div><p>Tap a domain to start a focused set.</p></div><div className="grid">{activeDomains.map(item => <button className="topic-card" key={item.name} onClick={() => chooseDomain(item.name)}><span className="count">{item.target} TARGET · {domainStats(item.name).total} FORMS</span><h3>{item.name}</h3><p>{item.summary}</p></button>)}</div></section>
  <section className="section history"><article className="panel"><h3>Coverage, at a glance</h3>{activeDomains.map(item => { const stat = domainStats(item.name); const complete = stat.total ? Math.round(stat.done / stat.total * 100) : 0; return <div className="progress-row" key={item.name}><span>{item.name}</span><div className="bar"><i style={{ width: `${complete}%` }} /></div><b>{complete}%</b></div>; })}</article><article className="panel"><h3>Study sources for this library</h3><p className="empty">The blueprint guides the mix. Every domain points toward a public official safety, scope, or blueprint reference.</p><div className="source-list">{activeDomains.map(item => <a key={item.name} href={domainReferences[item.name].href} target="_blank" rel="noreferrer"><span>{item.name}</span>{domainReferences[item.name].title} ↗</a>)}</div><p className="source-note">Full official and commercial resource list: <button onClick={() => openTrack(examTrack)}>Study Library</button>.</p></article></section>
  {pepTalk && <aside className="pep-popup" role="dialog" aria-label="A little encouragement"><span>{pepTalk.emoji}</span><div><b>{pepTalk.title}</b><p>{pepTalk.message}</p></div><button onClick={closePepTalk} aria-label="Close encouragement">×</button></aside>}
  </main>;
}
