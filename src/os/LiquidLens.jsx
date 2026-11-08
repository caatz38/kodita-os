// The glass droplet that glides between taskbar icons (iOS 26 tab-bar style).
// Driven by spring physics on a single element with transform only → no repaints.
import { useEffect, useRef } from 'react';
import { Spring, prefersReducedMotion } from './liquid.js';

export default function LiquidLens({ containerRef }) {
  const lensRef = useRef(null);

  useEffect(() => {
    const box = containerRef.current;
    const lens = lensRef.current;
    if (!box || !lens) return;
    const reduce = prefersReducedMotion();
    const x = new Spring(0, { stiffness: 480, damping: 28 });
    const opacity = new Spring(0, { stiffness: 320, damping: 30 });
    const press = new Spring(1, { stiffness: 900, damping: 13 }); // low damping → jelly bounce
    let raf = 0;
    let last = 0;

    const render = () => {
      // stretch along the direction of travel, squash across it (liquid!)
      const v = Math.abs(x.velocity);
      const stretch = Math.min(v / 2200, 0.45);
      const sx = (1 + stretch) * press.value;
      const sy = (1 - stretch * 0.38) * (1 + (1 - press.value) * 0.35) * press.value;
      lens.style.transform = `translate3d(${x.value - 21}px, 0, 0) scale(${sx.toFixed(4)}, ${Math.max(0.6, sy).toFixed(4)})`;
      lens.style.opacity = Math.max(0, Math.min(1, opacity.value)).toFixed(3);
    };
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      for (const s of [x, opacity, press]) s.step(dt);
      render();
      raf = x.settled && opacity.settled && press.settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (reduce) {
        for (const s of [x, opacity, press]) { s.value = s.target; s.velocity = 0; }
        render();
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const targetOf = (btn) => {
      const r = btn.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      return r.left - b.left + r.width / 2;
    };
    const onOver = (e) => {
      const btn = e.target.closest('[data-lens]');
      if (!btn || !box.contains(btn)) return;
      const tx = targetOf(btn);
      if (opacity.value < 0.05) { x.value = tx; x.velocity = 0; } // appear in place, don't fly in
      x.target = tx;
      opacity.target = 1;
      kick();
    };
    const onLeave = () => { opacity.target = 0; kick(); };
    const onDown = (e) => {
      if (!e.target.closest('[data-lens]')) return;
      press.target = 0.84;
      kick();
    };
    const onUp = () => {
      if (press.target === 1) return;
      press.target = 1;
      press.velocity = 6; // fling past 1 → jelly overshoot
      kick();
    };

    box.addEventListener('pointerover', onOver);
    box.addEventListener('pointerleave', onLeave);
    box.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    render();
    return () => {
      cancelAnimationFrame(raf);
      box.removeEventListener('pointerover', onOver);
      box.removeEventListener('pointerleave', onLeave);
      box.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [containerRef]);

  return <div className="tb-lens" ref={lensRef} aria-hidden />;
}
