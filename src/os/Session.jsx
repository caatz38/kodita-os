import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Wifi120Regular, Battery820Regular, ArrowRight20Regular, Power20Regular } from '@fluentui/react-icons';
import { config } from '../content/config.js';
import { useSettings } from './SettingsContext.jsx';
import { useClock } from './useClock.js';
import { useWindowActions } from './OSContext.jsx';
import './Session.css';

// Power states: boot → lock → signin → welcome → desktop.  Also: sleep, restarting, shutting, off.
const SessionContext = createContext(null);
export const useSession = () => useContext(SessionContext);

const KEY = 'kodita:session';
function initialState() {
  if (config.boot === false) return 'desktop';
  try {
    // A reload in the same browser tab skips the boot + sign-in (accidental F5 during class).
    if (sessionStorage.getItem(KEY) === 'desktop') return 'desktop';
  } catch {
    /* ignore */
  }
  return 'boot';
}

export function SessionProvider({ children }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, state === 'desktop' ? 'desktop' : 'locked');
    } catch {
      /* ignore */
    }
  }, [state]);

  const value = useMemo(() => ({ state, setState }), [state]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// Power actions for the Start menu.
export function usePower() {
  const { setState } = useSession();
  return useMemo(
    () => ({
      lock: () => setState('lock'),
      sleep: () => setState('sleep'),
      restart: () => setState('restarting'),
      shutdown: () => setState('shutting'),
    }),
    [setState]
  );
}

function Spinner({ size = 40 }) {
  return (
    <div className="ss-spinner" style={{ width: size, height: size }}>
      {[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
    </div>
  );
}

function Boot({ onDone }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current(), 2600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="ss ss-black" onClick={onDone}>
      <img className="ss-boot-logo" src={config.logo} alt="" />
      <div className="ss-boot-spin"><Spinner /></div>
    </div>
  );
}

function Lock({ state, setState }) {
  const { wallpaper } = useSettings();
  const now = useClock();
  const [phase, setPhase] = useState(state); // lock | signin | welcome
  const btnRef = useRef(null);

  const toSignin = useCallback(() => setPhase('signin'), []);
  const signIn = () => {
    if (config.fullscreenOnSignIn !== false && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    setPhase('welcome');
    setTimeout(() => setState('desktop'), 1100);
  };

  useEffect(() => {
    if (phase === 'signin') setTimeout(() => btnRef.current?.focus(), 350);
    const onKey = (e) => {
      if (phase === 'lock') toSignin();
      else if (phase === 'signin' && e.key === 'Escape') setPhase('lock');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, toSignin]);

  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/, '');
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="ss ss-lock-root">
      {/* sign-in layer (blurred wallpaper) */}
      <div className="ss-signin-bg" style={{ backgroundImage: `url(${wallpaper})` }} />
      <div className={`ss-signin ${phase !== 'lock' ? 'show' : ''}`}>
        <div className="ss-avatar"><img src={config.logo} alt="" /></div>
        <div className="ss-user">{config.userName}</div>
        {phase === 'welcome' ? (
          <div className="ss-welcome"><Spinner size={28} /> Welcome</div>
        ) : (
          <button ref={btnRef} className="ss-signin-btn" onClick={signIn}>
            Sign in <ArrowRight20Regular />
          </button>
        )}
      </div>

      {/* lock layer (slides up) */}
      <div
        className={`ss-lock ${phase !== 'lock' ? 'up' : ''}`}
        style={{ backgroundImage: `url(${wallpaper})` }}
        onClick={toSignin}
        onWheel={toSignin}
      >
        <div className="ss-time">{time}</div>
        <div className="ss-date">{date}</div>
        <div className="ss-lock-hint">Click or press any key to unlock</div>
      </div>

      <div className="ss-corner">
        <Wifi120Regular />
        <Battery820Regular />
        {phase === 'signin' && <button className="ss-power" title="Power" onClick={() => setState('shutting')}><Power20Regular /></button>}
      </div>
    </div>
  );
}

export function SessionScreens() {
  const { state, setState } = useSession();
  const { closeAll } = useWindowActions();

  // Restart / shut down: show the spinner, close everything, then boot or power off.
  useEffect(() => {
    if (state !== 'shutting' && state !== 'restarting') return;
    const t = setTimeout(() => {
      closeAll();
      setState(state === 'restarting' ? 'boot' : 'off');
    }, 1800);
    return () => clearTimeout(t);
  }, [state, setState, closeAll]);

  const wake = useCallback(() => setState('lock'), [setState]);
  useEffect(() => {
    if (state !== 'sleep' && state !== 'off') return;
    const onKey = () => setState(state === 'off' ? 'boot' : 'lock');
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, setState]);

  switch (state) {
    case 'boot':
      return <Boot onDone={() => setState('lock')} />;
    case 'lock':
      return <Lock key="lock" state="lock" setState={setState} />;
    case 'sleep':
      return <div className="ss ss-black ss-fade" onClick={wake} />;
    case 'off':
      return <div className="ss ss-black" onClick={() => setState('boot')}><span className="ss-off-hint">Click to turn on</span></div>;
    case 'restarting':
    case 'shutting':
      return (
        <div className="ss ss-blue">
          <Spinner />
          <div className="ss-msg">{state === 'restarting' ? 'Restarting' : 'Shutting down'}</div>
        </div>
      );
    default:
      return null;
  }
}
