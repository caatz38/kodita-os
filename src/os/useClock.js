import { useEffect, useState } from 'react';

export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
export const fmtDate = (d) => d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
