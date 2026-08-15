'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { domainReferences, domains, questions, type Domain, type Question } from '../lib/questions';
import { studyResources, type StudyTrack } from '../lib/resources';

type View = 'home' | 'study' | 'flashcards' | 'rewards' | 'resources';
type Mode = 'Random topics' | 'Fresh in selection' | 'All scenario forms' | 'Review incorrect';
type StudyRecord = { correct: boolean; selected: number; answeredAt: string; alternate: boolean };
type Progress = Record<string, StudyRecord>;
type SavedSession = { current: Question; domain: Domain | 'All domains'; topic: string; mode: Mode; selected: number | null; revealed: boolean; savedAt: string };
type Player = { xp: number; streak: number; bestStreak: number; correct: number; unlocked: string[] };
type Celebration = { title: string; message: string; emoji: string } | null;

const storageKey = 'snle-study-compass-progress-v2';
const sessionKey = 'snle-study-compass-session-v1';
const playerKey = 'snle-study-compass-player-v1';
const letters = ['A', 'B', 'C', 'D'];
const rewards = [
  { id: 'spark', threshold: 1, emoji: '⭐', title: 'First Spark', message: 'One correct answer is a real beginning.' },
  { id: 'steady', threshold: 10, emoji: '🌱', title: 'Steady Starter', message: 'Ten correct answers—your habits are growing.' },
  { id: 'bright', threshold: 25, emoji: '✨', title: 'Bright Mind', message: 'Twenty-five clinical wins unlocked.' },
  { id: 'charger', threshold: 50, emoji: '⚡', title: 'Care Charger', message: 'Fifty correct answers—your revision energy is showing.' },
  { id: 'legend', threshold: 100, emoji: '🏆', title: 'Study Legend', message: 'One hundred correct answers. That is serious momentum.' },
];
const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function loadProgress(): Progress { try { return JSON.parse(window.localStorage.getItem(storageKey) || '{}') as Progress; } catch { return {}; } }
function loadSession(): SavedSession | null {
  try {
    const saved = JSON.parse(window.localStorage.getItem(sessionKey) || 'null') as SavedSession | null;
    return saved?.current?.choices?.length === 4 && typeof saved.current.stem === 'string' ? saved : null;
  } catch { return null; }
}
function loadPlayer(): Player { try { return JSON.parse(window.localStorage.getItem(playerKey) || '{"xp":0,"streak":0,"bestStreak":0,"correct":0,"unlocked":[]}') as Player; } catch { return { xp: 0, streak: 0, bestStreak: 0, correct: 0, unlocked: [] }; } }

function alternateForm(question: Question): Question {
  const frames = ['During a focused clinical handover, ', 'In a comparable but newly presented scenario, ', 'While prioritizing care on a busy shift, ', 'During a safety review with the nursing team, '];
  return {
    ...question,
    id: `${question.id}-alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    stem: `${randomItem(frames)}${question.stem.charAt(0).toLowerCase()}${question.stem.slice(1)}`,
    isAlternateForm: true,
  };
}

export default function StudyCompass() {
  const [view, setView] = useState<View>('home');
  const [domain, setDomain] = useState<Domain | 'All domains'>('All domains');
  const [topic, setTopic] = useState('All topics');
  const [mode, setMode] = useState<Mode>('Random topics');
  const [progress, setProgress] = useState<Progress>({});
  const [current, setCurrent] = useState<Question>(questions[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [player, setPlayer] = useState<Player>({ xp: 0, streak: 0, bestStreak: 0, correct: 0, unlocked: [] });
  const [celebration, setCelebration] = useState<Celebration>(null);
  const [resourceTrack, setResourceTrack] = useState<StudyTrack>('SNLE');
  const skipInitialSessionWrite = useRef(true);

  useEffect(() => {
    setProgress(loadProgress());
    setSavedSession(loadSession());
    setPlayer(loadPlayer());
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    if (skipInitialSessionWrite.current) { skipInitialSessionWrite.current = false; return; }
    const nextSession: SavedSession = { current, domain, topic, mode, selected, revealed, savedAt: new Date().toISOString() };
    try { window.localStorage.setItem(sessionKey, JSON.stringify(nextSession)); } catch {}
    setSavedSession(nextSession);
  }, [current, domain, mode, revealed, selected, storageLoaded, topic]);

  const topics = useMemo(() => [...new Set(questions.filter(q => domain === 'All domains' || q.domain === domain).map(q => q.topic))], [domain]);
  const summary = useMemo(() => {
    const attempts = Object.values(progress);
    const correct = attempts.filter(item => item.correct).length;
    return { answered: attempts.length, correct, accuracy: attempts.length ? Math.round(correct / attempts.length * 100) : 0 };
  }, [progress]);
  const percent = Math.round(summary.answered / questions.length * 100) || 0;

  const domainStats = (name: Domain) => {
    const items = questions.filter(q => q.domain === name);
    const completed = items.filter(q => progress[q.id]);
    return { total: items.length, done: completed.length };
  };

  const pickQuestion = (nextDomain = domain, nextTopic = topic, nextMode = mode) => {
    const inSelection = questions.filter(q => (nextDomain === 'All domains' || q.domain === nextDomain) && (nextTopic === 'All topics' || q.topic === nextTopic));
    const pool = nextMode === 'Random topics' ? questions : inSelection;
    if (!pool.length) return questions[0];
    if (nextMode === 'Review incorrect') {
      const incorrect = pool.filter(q => progress[q.id] && !progress[q.id].correct);
      if (incorrect.length) return randomItem(incorrect);
    }
    if (nextMode === 'All scenario forms') return randomItem(pool);
    const unseen = pool.filter(q => !progress[q.id] && q.id !== current.id);
    if (unseen.length) return randomItem(unseen);
    return alternateForm(randomItem(pool));
  };

  const startQuestion = (nextDomain = domain, nextTopic = topic, nextMode = mode) => {
    setCurrent(pickQuestion(nextDomain, nextTopic, nextMode));
    setSelected(null);
    setRevealed(false);
  };

  const saveAnswer = (index: number) => {
    if (selected !== null) return;
    const isCorrect = index === current.correctIndex;
    const nextProgress = { ...progress, [current.id]: { correct: isCorrect, selected: index, answeredAt: new Date().toISOString(), alternate: current.isAlternateForm } };
    setSelected(index);
    setProgress(nextProgress);
    try { window.localStorage.setItem(storageKey, JSON.stringify(nextProgress)); } catch {}
    setPlayer(previous => {
      const nextCorrect = previous.correct + (isCorrect ? 1 : 0);
      const nextStreak = isCorrect ? previous.streak + 1 : 0;
      const newlyUnlocked = isCorrect ? rewards.find(reward => nextCorrect >= reward.threshold && !previous.unlocked.includes(reward.id)) : undefined;
      const next = {
        xp: previous.xp + (isCorrect ? 12 + Math.min(nextStreak, 8) : 2),
        streak: nextStreak,
        bestStreak: Math.max(previous.bestStreak, nextStreak),
        correct: nextCorrect,
        unlocked: newlyUnlocked ? [...previous.unlocked, newlyUnlocked.id] : previous.unlocked,
      };
      try { window.localStorage.setItem(playerKey, JSON.stringify(next)); } catch {}
      if (newlyUnlocked) setCelebration(newlyUnlocked);
      return next;
    });
  };

  const navigate = (next: View) => { setView(next); setSelected(null); setRevealed(false); };
  const openTrack = (track: StudyTrack) => { setResourceTrack(track); setView('resources'); };
  const chooseDomain = (nextDomain: Domain) => { setDomain(nextDomain); setTopic('All topics'); setMode('Fresh in selection'); startQuestion(nextDomain, 'All topics', 'Fresh in selection'); setView('study'); };
  const resumeSession = () => {
    if (!savedSession) return;
    setDomain(savedSession.domain); setTopic(savedSession.topic); setMode(savedSession.mode); setCurrent(savedSession.current);
    setSelected(savedSession.selected); setRevealed(savedSession.revealed); setView('study');
  };
  const startNewSession = () => {
    setDomain('All domains'); setTopic('All topics'); setMode('Random topics');
    startQuestion('All domains', 'All topics', 'Random topics'); setView('study');
  };
  const selectedCorrect = selected === current.correctIndex;
  const showRationale = selectedCorrect || revealed;
  const flashcards = questions.filter(q => q.variantNumber === 0 && (domain === 'All domains' || q.domain === domain));
  const level = Math.floor(player.xp / 100) + 1;
  const nextReward = rewards.find(reward => !player.unlocked.includes(reward.id));

  const header = (active: View) => <header className="nav">
    <button className="brand" onClick={() => navigate('home')} aria-label="SNLE Study Compass home"><span className="mark">S</span> SNLE Study Compass</button>
    <div className="nav-actions">
      <button className={`nav-link ${active === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>Overview</button>
      <button className={`nav-link ${active === 'study' ? 'active' : ''}`} onClick={() => navigate('study')}>Practice</button>
      <button className={`nav-link ${active === 'flashcards' ? 'active' : ''}`} onClick={() => navigate('flashcards')}>Flashcards</button>
      <button className={`nav-link ${active === 'rewards' ? 'active' : ''}`} onClick={() => navigate('rewards')}>Rewards</button>
      <button className={`nav-link ${active === 'resources' ? 'active' : ''}`} onClick={() => openTrack('SNLE')}>Library</button>
    </div>
  </header>;

  if (view === 'resources') return <main className="shell">{header('resources')}<section className="section" style={{ marginTop: 0 }}>
    <p className="eyebrow">Your study library</p><h1 className="page-title">Choose the exam first.<br />Then choose what helps.</h1>
    <p className="hero-copy">These are public official references and legitimate commercial companions. Use them to understand topics—never to copy or circulate protected reviewer questions.</p>
    <div className="track-toggle"><button className={resourceTrack === 'SNLE' ? 'selected' : ''} onClick={() => setResourceTrack('SNLE')}>🇸🇦 SNLE · Saudi Arabia</button><button className={resourceTrack === 'PNLE' ? 'selected' : ''} onClick={() => setResourceTrack('PNLE')}>🇵🇭 PNLE · Philippines</button></div>
    <div className="resource-grid">{studyResources[resourceTrack].map(resource => <a className="resource-card" key={resource.title} href={resource.href} target="_blank" rel="noreferrer"><span>{resource.kind}</span><h2>{resource.title}</h2><p>{resource.text}</p><b>Open resource ↗</b></a>)}</div>
    {resourceTrack === 'PNLE' && <article className="track-note"><span>🇵🇭</span><div><h2>PNLE is kept separate on purpose.</h2><p>The next PNLE question bank will be written as original items mapped to the PRC’s published five Nursing Practice areas. It will not be mixed with Saudi-specific SNLE rules or copied reviewer material.</p></div></article>}
  </section></main>;

  if (view === 'rewards') return <main className="shell">{header('rewards')}<section className="section" style={{ marginTop: 0 }}>
    <p className="eyebrow">Your little wins</p><h1 className="page-title">Every answer is<br />a tiny level-up.</h1>
    <div className="game-stats"><article><span>LEVEL</span><strong>{level}</strong><p>{player.xp} XP collected</p></article><article><span>BEST STREAK</span><strong>{player.bestStreak}</strong><p>Correct in a row</p></article><article><span>CLINICAL WINS</span><strong>{player.correct}</strong><p>Correct answers</p></article></div>
    <div className="section-head" style={{ marginTop: 44 }}><div><p className="eyebrow">Badge shelf</p><h2>Keep going for these</h2></div>{nextReward && <p>{nextReward.threshold - player.correct > 0 ? `${nextReward.threshold - player.correct} more correct for ${nextReward.title}` : 'New reward ready!'}</p>}</div>
    <div className="badge-grid">{rewards.map(reward => { const unlocked = player.unlocked.includes(reward.id); return <article className={`badge ${unlocked ? 'unlocked' : ''}`} key={reward.id}><span>{reward.emoji}</span><h2>{reward.title}</h2><p>{reward.message}</p><b>{unlocked ? 'Unlocked!' : `${reward.threshold} correct answers`}</b></article>; })}</div>
  </section></main>;

  if (view === 'flashcards') return <main className="shell">{header('flashcards')}<section className="section" style={{ marginTop: 0 }}>
    <div className="section-head"><div><p className="eyebrow">Fast active recall</p><h2>Flashcards for clinical anchors</h2></div><div className="field" style={{ minWidth: 190, margin: 0 }}><label htmlFor="flash-domain">Focus domain</label><select id="flash-domain" value={domain} onChange={event => setDomain(event.target.value as Domain | 'All domains')}><option>All domains</option>{domains.map(item => <option key={item.name}>{item.name}</option>)}</select></div></div>
    <p className="card-note">Tap a card to reveal the key action and why it matters. Cards come from the same original competency bank as practice questions.</p>
    <div className="flash-grid">{flashcards.map(question => <button className={`flashcard ${flipped.has(question.id) ? 'flipped' : ''}`} key={question.id} onClick={() => setFlipped(previous => { const next = new Set(previous); next.has(question.id) ? next.delete(question.id) : next.add(question.id); return next; })}>
      <span className="front">{question.topic}</span><h3>{question.stem}</h3><p className="front">Tap to reveal</p><div className="back"><span className="back-label">Best response</span><h3>{question.choices[question.correctIndex]}</h3><p>{question.rationale}</p></div>
    </button>)}</div>
  </section></main>;

  if (view === 'study') return <main className="shell">{header('study')}<div className="study-layout">
    <aside className="study-controls"><h2>Shape your set</h2>
      <div className="field"><label htmlFor="domain">Domain</label><select id="domain" value={domain} onChange={event => { const next = event.target.value as Domain | 'All domains'; setDomain(next); setTopic('All topics'); setMode('Fresh in selection'); startQuestion(next, 'All topics', 'Fresh in selection'); }}><option>All domains</option>{domains.map(item => <option key={item.name}>{item.name}</option>)}</select></div>
      <div className="field"><label htmlFor="topic">Topic</label><select id="topic" value={topic} onChange={event => { const next = event.target.value; setTopic(next); setMode('Fresh in selection'); startQuestion(domain, next, 'Fresh in selection'); }}><option>All topics</option>{topics.map(item => <option key={item}>{item}</option>)}</select></div>
      <div className="field"><label htmlFor="mode">Mode</label><select id="mode" value={mode} onChange={event => { const next = event.target.value as Mode; setMode(next); startQuestion(domain, topic, next); }}><option>Random topics</option><option>Fresh in selection</option><option>All scenario forms</option><option>Review incorrect</option></select></div>
      <div className="progress-caption"><span>{summary.answered} answered</span><span>{questions.length} core forms</span></div><div className="bar"><i style={{ width: `${percent}%` }} /></div>
      <button className="secondary" style={{ width: '100%', marginTop: 18 }} onClick={() => startQuestion()}>New question</button>
    </aside>
    <section className="question-card"><div className="question-meta"><span className="tag">{current.domain} · {current.topic.split(' — ').pop()}</span><span className="difficulty">{current.isAlternateForm ? 'ALTERNATE FORM' : `SCENARIO ${current.variantNumber + 1}`}</span></div>
      <h1 className="question-title">{current.stem}</h1>
      <div className="answer-list">{current.choices.map((choice, index) => { const wrong = selected !== null && selected === index && index !== current.correctIndex; const correct = selected !== null && index === current.correctIndex && showRationale; return <button className={`answer-btn ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} disabled={selected !== null} key={choice} onClick={() => saveAnswer(index)}><span className="letter">{letters[index]}</span><span>{choice}</span></button>; })}</div>
      {selected !== null && <div className={`feedback ${selectedCorrect ? 'good' : 'bad'}`}><h3>{selectedCorrect ? 'Correct — keep the clinical priority.' : 'Not quite — pause before moving on.'}</h3>{showRationale ? <><p className="rationale"><strong>Rationale:</strong> {current.rationale}</p><p className="question-reference">Suggested study reference: <a href={domainReferences[current.domain].href} target="_blank" rel="noreferrer">{domainReferences[current.domain].title} ↗</a></p></> : <p>Select <strong>Reveal answer</strong> to see the correct option and rationale, or move to a new question.</p>}</div>}
      <div className="study-actions"><p className="muted">Choose the <strong>one best answer</strong>. Your answer saves privately in this browser.</p><div className="hero-buttons">{selected !== null && !selectedCorrect && !revealed && <button className="secondary" onClick={() => setRevealed(true)}>Reveal answer</button>}{selected !== null && <button className="primary" onClick={() => startQuestion()}>Next question →</button>}</div></div>
    </section>
  </div>{celebration && <div className="celebration-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title"><article className="celebration-card"><span>{celebration.emoji}</span><p className="eyebrow">Reward unlocked</p><h2 id="reward-title">{celebration.title}</h2><p>{celebration.message}</p><div className="reward-score"><b>Level {level}</b><span>{player.xp} XP · {player.bestStreak} best streak</span></div><p className="share-note">Screenshot this little win and share it with your mentor or boss—no patient details, just your progress.</p><button className="primary" onClick={() => setCelebration(null)}>Keep playing →</button></article></div>}</main>;

  return <main className="shell">{header('home')}<section className="hero"><div>
    <p className="eyebrow">Your study playground · SNLE ready</p><h1>Little wins.<br />Big nurse energy.</h1><p className="hero-copy">Play through friendly clinical challenges, collect XP, and grow your confidence one calm decision at a time. The nursing judgment stays serious; the journey gets to feel good.</p>
    <div className="hero-buttons"><button className="primary" onClick={startNewSession}>Play a new round <span aria-hidden="true">→</span></button>{savedSession && <button className="secondary" onClick={resumeSession}>Resume my round</button>}<button className="secondary" onClick={() => openTrack('PNLE')}>🇵🇭 PNLE / Philippines</button></div>
  </div><aside className="focus-card game-card"><p className="eyebrow">Your player card</p><div className="level-orb">{level}</div><h2>Level {level} learner<br /><em>{player.xp} XP collected</em></h2><div className="mini-progress">{Array.from({ length: 8 }, (_, index) => <span className={index < Math.round((player.xp % 100) / 12.5) ? 'done' : ''} key={index} />)}</div><p>{nextReward ? `${Math.max(0, nextReward.threshold - player.correct)} more correct answer${nextReward.threshold - player.correct === 1 ? '' : 's'} to unlock ${nextReward.emoji} ${nextReward.title}.` : 'Every badge is yours—keep your streak glowing.'}</p></aside>
  </section><section className="section"><div className="section-head"><div><p className="eyebrow">Pick your lane</p><h2>Practice by blueprint domain</h2></div><p>Tap a domain to start a focused set.</p></div><div className="grid">{domains.map(item => <button className="topic-card" key={item.name} onClick={() => chooseDomain(item.name)}><span className="count">{item.target} TARGET · {domainStats(item.name).total} FORMS</span><h3>{item.name}</h3><p>{item.summary}</p></button>)}</div></section>
  <section className="section history"><article className="panel"><h3>Coverage, at a glance</h3>{domains.map(item => { const stat = domainStats(item.name); const complete = stat.total ? Math.round(stat.done / stat.total * 100) : 0; return <div className="progress-row" key={item.name}><span>{item.name}</span><div className="bar"><i style={{ width: `${complete}%` }} /></div><b>{complete}%</b></div>; })}</article><article className="panel"><h3>Study sources, not just one link</h3><p className="empty">The blueprint guides the mix. Each domain also points you toward a public nursing-safety or scope reference while you review.</p><div className="source-list">{domains.map(item => <a key={item.name} href={domainReferences[item.name].href} target="_blank" rel="noreferrer"><span>{item.name}</span>{domainReferences[item.name].title} ↗</a>)}</div><p className="source-note">Full official and commercial resource list: <button onClick={() => openTrack('SNLE')}>Study Library</button>.</p></article></section>
  </main>;
}
