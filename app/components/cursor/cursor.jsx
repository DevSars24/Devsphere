import { useEffect, useRef, useCallback, useState } from 'react';
import styles from './cursor.module.css';

const LERP_RING = 0.15;
const LERP_DOT = 0.45;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);
  
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [clicking, setClicking] = useState(false);

  const onMouseMove = useCallback((e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    if (!visible) setVisible(true);
  }, [visible]);

  const onMouseDown = useCallback(() => setClicking(true), []);
  const onMouseUp = useCallback(() => setClicking(false), []);
  const onMouseLeave = useCallback(() => setVisible(false), []);
  const onMouseEnter = useCallback(() => setVisible(true), []);

  useEffect(() => {
    const selector = 'a, button, [role="button"], input, textarea, select, label, [data-cursor-hover]';

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

  useEffect(() => {
    function animate() {
      // ring follows with lag
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, LERP_RING);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, LERP_RING);

      // dot follows more tightly
      dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, LERP_DOT);
      dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, LERP_DOT);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    }

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

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

  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return null;

  return (
    <>
      <div
        ref={ringRef}
        className={styles.ring}
        data-visible={visible}
        data-hover={hover}
        data-clicking={clicking}
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className={styles.dot}
        data-visible={visible}
        data-hover={hover}
        data-clicking={clicking}
        aria-hidden="true"
      />
    </>
  );
}
