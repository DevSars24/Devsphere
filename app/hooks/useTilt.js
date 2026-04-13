import { useRef, useEffect } from 'react';

export function useTilt({ maxTilt = 4, perspective = 1000, speed = 400, glare = false, maxGlare = 0.5 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeoutId = null;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      if (glare) {
        const glareEl = el.querySelector('[data-tilt-glare]');
        if (glareEl) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glareEl.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${maxGlare}) 0%, transparent 80%)`;
          glareEl.style.opacity = '1';
        }
      }
    };

    const handleMouseEnter = () => {
      el.style.transition = `transform 0.1s ease`;
      if (timeoutId) clearTimeout(timeoutId);
    };

    const handleMouseLeave = () => {
      el.style.transition = `transform ${speed}ms ease`;
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      
      if (glare) {
        const glareEl = el.querySelector('[data-tilt-glare]');
        if (glareEl) {
          glareEl.style.opacity = '0';
        }
      }
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [maxTilt, perspective, speed, glare, maxGlare]);

  return ref;
}
