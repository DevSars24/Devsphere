import { useEffect, useRef, useCallback, useState } from 'react';
import styles from './cursor.module.css';

const TRAIL_COUNT = 5;
const LERP_RING = 0.12;
const LERP_DOT = 0.35;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const trailRefs = useRef([]);
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const trailPositions = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const rafId = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [clicking, setClicking] = useState(false);
  const velocity = useRef({ x: 0, y: 0 });
  const lastMouse = useRef({ x: -100, y: -100 });

  const onMouseMove = useCallback((e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    setVisible(true);
  }, []);

  const onMouseDown = useCallback(() => setClicking(true), []);
  const onMouseUp = useCallback(() => setClicking(false), []);
  const onMouseLeave = useCallback(() => setVisible(false), []);
  const onMouseEnter = useCallback(() => setVisible(true), []);

  // hover detection for interactive elements
  useEffect(() => {
    const selector =
      'a, button, [role="button"], input, textarea, select, label, [data-cursor-hover]';

    function handleOver(e) {
      if (e.target.closest(selector)) setHover(true);
    }
    function handleOut(e) {
      if (e.target.closest(selector)) setHover(false);
    }

    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);
    return () => {
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
    };
  }, []);

  // animation loop
  useEffect(() => {
    function animate() {
      // compute velocity
      velocity.current.x = mouse.current.x - lastMouse.current.x;
      velocity.current.y = mouse.current.y - lastMouse.current.y;
      lastMouse.current.x = mouse.current.x;
      lastMouse.current.y = mouse.current.y;

      const speed = Math.sqrt(
        velocity.current.x ** 2 + velocity.current.y ** 2
      );

      // ring follows with lag
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, LERP_RING);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, LERP_RING);

      // dot follows more tightly
      dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, LERP_DOT);
      dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, LERP_DOT);

      // trails follow each other in a chain
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const target = i === 0 ? dotPos.current : trailPositions.current[i - 1];
        const t = 0.2 - i * 0.025;
        trailPositions.current[i].x = lerp(
          trailPositions.current[i].x,
          target.x,
          t
        );
        trailPositions.current[i].y = lerp(
          trailPositions.current[i].y,
          target.y,
          t
        );
      }

      // apply transforms
      if (ringRef.current) {
        const scaleX = 1 + Math.min(speed * 0.004, 0.15);
        const scaleY = 1 - Math.min(speed * 0.002, 0.08);
        const angle = Math.atan2(velocity.current.y, velocity.current.x);
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%) rotate(${angle}rad) scale(${scaleX}, ${scaleY})`;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`;
      }

      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        const pos = trailPositions.current[i];
        const opacity = speed > 2 ? Math.max(0.35 - i * 0.07, 0) : 0;
        const size = Math.max(5 - i * 0.8, 1);
        el.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
        el.style.opacity = opacity;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      });

      rafId.current = requestAnimationFrame(animate);
    }

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  // mouse events
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [onMouseMove, onMouseDown, onMouseUp, onMouseLeave, onMouseEnter]);

  // Check for touch device — render nothing
  const isTouch =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return null;

  return (
    <>
      {/* Ring */}
      <div
        ref={ringRef}
        className={styles.ring}
        data-visible={visible}
        data-hover={hover}
        data-clicking={clicking}
        aria-hidden="true"
      />

      {/* Dot */}
      <div
        ref={dotRef}
        className={styles.dot}
        data-visible={visible}
        data-hover={hover}
        data-clicking={clicking}
        aria-hidden="true"
      />

      {/* Trail particles */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className={styles.trail}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
