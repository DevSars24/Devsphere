import { useRef, useCallback, useEffect } from 'react';

/**
 * Smooth 3D tilt effect that follows the mouse.
 * @param {object} opts
 * @param {number} opts.maxTilt   – max rotation degrees (default 6)
 * @param {number} opts.scale     – hover scale (default 1.02)
 * @param {number} opts.speed     – transition ms (default 400)
 * @param {boolean} opts.glare    – enable glare overlay (default false)
 * @returns {React.RefObject}
 */
export function useTilt({
  maxTilt = 6,
  scale = 1.02,
  speed = 400,
  glare = false,
} = {}) {
  const ref = useRef(null);

  const handleMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

      if (glare) {
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        const glareEl = el.querySelector('[data-tilt-glare]');
        if (glareEl) {
          glareEl.style.opacity = '0.12';
          glareEl.style.background = `linear-gradient(${angle + 180}deg, rgba(255,255,255,0.25) 0%, transparent 60%)`;
        }
      }
    },
    [maxTilt, scale, glare]
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    if (glare) {
      const glareEl = el.querySelector('[data-tilt-glare]');
      if (glareEl) glareEl.style.opacity = '0';
    }
  }, [glare]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = `transform ${speed}ms cubic-bezier(.03,.98,.52,.99)`;
    el.style.willChange = 'transform';
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [handleMove, handleLeave, speed]);

  return ref;
}
