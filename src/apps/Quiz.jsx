import { memo, useEffect, useMemo, useState } from 'react';
import { Checkmark20Filled, Dismiss20Filled, Timer20Regular, ArrowRepeatAll20Regular } from '@fluentui/react-icons';
import { QuizAppIcon } from '../os/Icons.jsx';
import Picker from './Picker.jsx';
import './Quiz.css';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TIME = 20; // seconds per question when the timer is on

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.6,
        rot: Math.random() * 360,
        color: ['#ff4d6d', '#2b5cff', '#ffc233', '#2ec27e', '#8a3cf0', '#3ccbf4'][i % 6],
        w: 6 + Math.random() * 6,
      })),
    []
  );
  return (
    <div className="qz-confetti" aria-hidden>
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, background: p.color, width: p.w, height: p.w * 1.6, '--r': `${p.rot}deg` }} />
      ))}
    </div>
  );
}

function Quiz({ item, winId }) {
  if (!item) return <Picker type="quiz" title="Quizzes" winId={winId} />;
  return <QuizRun key={item.id} item={item} />;
}

function QuizRun({ item }) {
  const questions = item?.questions || [];
  const [stage, setStage] = useState('start'); // start | question | done
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timerOn, setTimerOn] = useState(true);
  const [left, setLeft] = useState(TIME);

  const q = questions[i];
  const correct = revealed && picked === q?.answer;

  const start = () => {
    setStage('question');
    setI(0);
    setPicked(null);
    setRevealed(false);
    setScore(0);
    setLeft(TIME);
  };
  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    if (picked === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= questions.length) return setStage('done');
    setI(i + 1);
    setPicked(null);
    setRevealed(false);
    setLeft(TIME);
  };

  // Countdown → auto reveal at 0.
  useEffect(() => {
    if (stage !== 'question' || revealed || !timerOn) return;
    if (left <= 0) { reveal(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, revealed, timerOn, left]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKeyDown = (e) => {
    if (stage === 'start' && e.key === 'Enter') return start();
    if (stage === 'done' && e.key === 'Enter') return start();
    if (stage !== 'question') return;
    const n = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
    if (n >= 0 && n < q.options.length && !revealed) setPicked(n);
    if (e.key === 'Enter') revealed ? next() : reveal();
  };

  if (!questions.length) {
    return (
      <div className="qz" data-autofocus tabIndex={-1}>
        <div className="qz-center">
          <QuizAppIcon size={72} />
          <h1>{item?.name || 'Quiz'}</h1>
          <p>Belum ada pertanyaan. Tambahkan di lessons.js.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qz" data-autofocus tabIndex={-1} onKeyDown={onKeyDown}>
      {stage === 'start' && (
        <div className="qz-center qz-pop">
          <QuizAppIcon size={88} />
          <h1>{item.name}</h1>
          <p>{questions.length} pertanyaan · pilih jawaban yang benar!</p>
          <label className="qz-toggle">
            <input type="checkbox" checked={timerOn} onChange={(e) => setTimerOn(e.target.checked)} />
            <span className="qz-switch" />
            <Timer20Regular /> Timer {TIME} detik
          </label>
          <button className="qz-primary qz-big" onClick={start}>Mulai Kuis</button>
        </div>
      )}

      {stage === 'question' && (
        <div className="qz-play" key={i}>
          <div className="qz-top">
            <span className="qz-chip">Soal {i + 1} / {questions.length}</span>
            <div className="qz-dots">
              {questions.map((_, k) => <span key={k} className={k < i ? 'done' : k === i ? 'now' : ''} />)}
            </div>
            <span className="qz-chip">⭐ {score}</span>
          </div>

          <div className="qz-question qz-pop">
            {timerOn && (
              <div className={`qz-timer ${left <= 5 && !revealed ? 'urgent' : ''}`} style={{ '--t': left / TIME }}>
                <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" /><circle cx="20" cy="20" r="17" className="qz-timer-fill" /></svg>
                <span>{left}</span>
              </div>
            )}
            <h2>{q.q}</h2>
          </div>

          <div className="qz-options">
            {q.options.map((opt, k) => {
              const state = revealed ? (k === q.answer ? 'right' : k === picked ? 'wrong' : 'faded') : picked === k ? 'picked' : picked != null ? 'dim' : '';
              return (
                <button
                  key={k}
                  className={`qz-opt qz-opt-${k} ${state}`}
                  style={{ '--d': `${k * 60}ms` }}
                  disabled={revealed}
                  onClick={() => setPicked(k)}
                >
                  <span className="qz-letter">{LETTERS[k]}</span>
                  <span className="qz-opt-text">{opt}</span>
                  {revealed && k === q.answer && <span className="qz-mark"><Checkmark20Filled /></span>}
                  {revealed && k === picked && k !== q.answer && <span className="qz-mark"><Dismiss20Filled /></span>}
                </button>
              );
            })}
          </div>

          <div className="qz-bottom">
            {!revealed ? (
              <>
                <button className="qz-ghost" onClick={reveal}>Tampilkan jawaban</button>
                <button className="qz-primary" disabled={picked == null} onClick={reveal}>Cek Jawaban</button>
              </>
            ) : (
              <>
                <span className={`qz-feedback ${correct ? 'good' : 'bad'}`}>
                  {picked == null ? 'Waktu habis! ⏰' : correct ? 'Benar! 🎉' : 'Kurang tepat 😅'}
                </span>
                <button className="qz-primary" onClick={next}>{i + 1 >= questions.length ? 'Lihat Hasil' : 'Lanjut →'}</button>
              </>
            )}
          </div>
        </div>
      )}

      {stage === 'done' && (
        <div className="qz-center qz-pop">
          {score / questions.length >= 0.6 && <Confetti />}
          <div className="qz-score">
            <span>{score}</span>/{questions.length}
          </div>
          <h1>
            {score === questions.length ? 'Sempurna! 🏆' : score / questions.length >= 0.6 ? 'Keren banget! 🎉' : 'Ayo coba lagi! 💪'}
          </h1>
          <p>Kamu menjawab {score} dari {questions.length} soal dengan benar.</p>
          <button className="qz-primary qz-big" onClick={start}><ArrowRepeatAll20Regular /> Ulangi Kuis</button>
        </div>
      )}
    </div>
  );
}

export default memo(Quiz);
