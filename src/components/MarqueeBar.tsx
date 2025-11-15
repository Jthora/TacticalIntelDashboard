import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useMarqueeItems } from '../hooks/useMarqueeItems';

interface MarqueeBarProps {
  speed?: number; // base pixels per second
  height?: number;
}

const SPEED_SCALE = 3.35; // reduce raw speed values to a calmer baseline
const MIN_BASE_SPEED = 1.2; // px per second

const computeBaseSpeed = (rawSpeed: number): number => {
  const scaled = (Number.isFinite(rawSpeed) && rawSpeed > 0) ? rawSpeed * SPEED_SCALE : 0;
  return Math.max(MIN_BASE_SPEED, scaled);
};

export const MarqueeBar: React.FC<MarqueeBarProps> = ({ speed = 12, height = 28 }) => {
  const items = useMarqueeItems();
  const baseSpeed = useMemo(() => computeBaseSpeed(speed), [speed]);
  const containerRef = useRef<HTMLDivElement|null>(null);
  const trackRef = useRef<HTMLDivElement|null>(null);
  const groupRef = useRef<HTMLDivElement|null>(null);
  const offsetRef = useRef(0);
  const groupWidthRef = useRef(0);
  const currentSpeedRef = useRef(baseSpeed);
  const targetSpeedRef = useRef(baseSpeed);
  const hoverActiveRef = useRef(false);
  const hoverHoldUntilRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [displaySpeed, setDisplaySpeed] = useState(baseSpeed);
  const lastSpeedUpdateRef = useRef(0);

  // Recompute group width after render when items change
  useEffect(() => {
    const measure = () => {
      if (groupRef.current) {
        groupWidthRef.current = groupRef.current.getBoundingClientRect().width;
        if (groupWidthRef.current === 0) {
          // Fallback heuristic for test/jsdom (no layout): estimate width by text length
          const text = Array.from(groupRef.current.querySelectorAll('.marquee-segment'))
            .map(el => el.textContent || '')
            .join(' • ');
          groupWidthRef.current = Math.max(300, text.length * 7); // min width safeguard
        }
        if (groupWidthRef.current > 0) {
          offsetRef.current = offsetRef.current % groupWidthRef.current;
        }
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [items]);

  // Animation loop
  useEffect(() => {
    let frame: number;
    let last = performance.now();

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = (now - last) / 1000;
      last = now;

      if (groupWidthRef.current === 0) {
        return;
      }

      if (hoverActiveRef.current && now > hoverHoldUntilRef.current) {
        hoverActiveRef.current = false;
      }

      const targetSpeed = paused ? 0 : (hoverActiveRef.current ? baseSpeed / 3 : baseSpeed);
      if (targetSpeedRef.current !== targetSpeed) {
        targetSpeedRef.current = targetSpeed;
      }

      // Ease current speed toward the desired target so changes feel smooth.
      const cs = currentSpeedRef.current;
      const ts = targetSpeedRef.current;
      currentSpeedRef.current = cs + (ts - cs) * 0.25;

      if (!paused) {
        const effectiveSpeed = currentSpeedRef.current;
        offsetRef.current = (offsetRef.current + effectiveSpeed * dt) % groupWidthRef.current;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
        }
      }

      if (now - lastSpeedUpdateRef.current > 120) {
        lastSpeedUpdateRef.current = now;
        setDisplaySpeed(currentSpeedRef.current);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, items.length, baseSpeed]);

  useEffect(() => {
    if (paused) {
      targetSpeedRef.current = 0;
      currentSpeedRef.current = 0;
      setDisplaySpeed(0);
    } else {
      targetSpeedRef.current = hoverActiveRef.current ? baseSpeed / 3 : baseSpeed;
      if (!hoverActiveRef.current) {
        currentSpeedRef.current = baseSpeed;
        setDisplaySpeed(baseSpeed);
      }
    }
  }, [paused, baseSpeed]);

  // Pause on document hidden to save resources
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const displayItems = items.slice(0, 120); // wider pool
  if (displayItems.length === 0) {
    return null;
  }

  const segments = displayItems.map(i => (
    <span key={i.id} className={`marquee-segment importance-${i.importance}`} title={i.text} onClick={() => i.link && window.open(i.link,'_blank')}>{i.text}</span>
  ));

  // Two groups for seamless looping
  return (
    <div
      className={`marquee-bar${paused?' paused':''}`}
      style={{height}}
      ref={containerRef}
      role="marquee"
      aria-label="Intelligence Marquee"
      data-base-speed={baseSpeed.toFixed(2)}
      data-current-speed={displaySpeed.toFixed(2)}
      onMouseEnter={() => {
        const nowMs = performance.now();
        hoverActiveRef.current = true;
        hoverHoldUntilRef.current = Math.max(hoverHoldUntilRef.current, nowMs + 1200);
        if (!paused) {
          targetSpeedRef.current = baseSpeed / 3;
        }
      }}
      onMouseLeave={() => {
        const nowMs = performance.now();
        hoverActiveRef.current = true;
        hoverHoldUntilRef.current = Math.max(hoverHoldUntilRef.current, nowMs + 900);
        if (!paused) {
          targetSpeedRef.current = baseSpeed / 3;
        }
      }}
    >
      <div className="marquee-track" ref={trackRef}>
        <div className="marquee-group" ref={groupRef}>{segments}</div>
        <div className="marquee-group" aria-hidden="true">{segments}</div>
      </div>
      <button className="marquee-pause-btn" onClick={()=>setPaused(p=>!p)} aria-label={paused? 'Resume marquee':'Pause marquee'}>{paused ? '▶' : '⏸'}</button>
    </div>
  );
};

export default MarqueeBar;
