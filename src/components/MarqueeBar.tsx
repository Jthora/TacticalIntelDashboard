import React, { useRef, useEffect, useState } from 'react';
import { useMarqueeItems } from '../hooks/useMarqueeItems';

interface MarqueeBarProps {
  speed?: number; // base pixels per second
  height?: number;
}

export const MarqueeBar: React.FC<MarqueeBarProps> = ({ speed = 34, height = 28 }) => {
  const items = useMarqueeItems();
  const containerRef = useRef<HTMLDivElement|null>(null);
  const trackRef = useRef<HTMLDivElement|null>(null);
  const groupRef = useRef<HTMLDivElement|null>(null);
  const offsetRef = useRef(0);
  const groupWidthRef = useRef(0);
  const currentSpeedRef = useRef(speed);
  const targetSpeedRef = useRef(speed);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [displaySpeed, setDisplaySpeed] = useState(speed);
  const lastSpeedUpdateRef = useRef(0);

  // Recompute group width after render when items change
  useEffect(() => {
    const measure = () => {
      if (groupRef.current) {
        groupWidthRef.current = groupRef.current.getBoundingClientRect().width;
        if (groupWidthRef.current === 0) {
          // Fallback heuristic for test/jsdom (no layout): estimate width by text length
            const text = Array.from(groupRef.current.querySelectorAll('.marquee-segment')).map(el => el.textContent || '').join(' • ');
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
      if (paused || groupWidthRef.current === 0) return;

      // Easing speed toward target (increase responsiveness)
      const cs = currentSpeedRef.current;
      const ts = targetSpeedRef.current;
      currentSpeedRef.current = cs + (ts - cs) * 0.25; // was 0.12

      const effectiveSpeed = currentSpeedRef.current;
      offsetRef.current = (offsetRef.current + effectiveSpeed * dt) % groupWidthRef.current;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      // Throttle display speed state updates (~every 120ms)
      if (now - lastSpeedUpdateRef.current > 120) {
        lastSpeedUpdateRef.current = now;
        setDisplaySpeed(currentSpeedRef.current);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, items.length]);

  // Hover slowdown logic
  useEffect(() => {
    targetSpeedRef.current = paused ? 0 : (hovered ? speed / 3 : speed);
  }, [hovered, paused, speed]);

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
    return (
      <div className="marquee-bar empty" style={{ height }}>
        <div className="marquee-empty">No live intelligence items</div>
      </div>
    );
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
      data-base-speed={speed}
      data-current-speed={displaySpeed.toFixed(2)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
