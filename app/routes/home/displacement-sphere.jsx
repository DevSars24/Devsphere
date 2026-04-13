import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion } from 'framer-motion';
import { useWindowSize } from '~/hooks';
import { useEffect, useRef, useCallback } from 'react';
import styles from './displacement-sphere.module.css';

const NUM_PARTICLES = 150;
const CONNECT_DISTANCE = 120;
const PARTICLE_SPEED = 0.35;
const DOT_RADIUS = 1.5;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export const DisplacementSphere = props => {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const reduceMotion = useReducedMotion();
  const windowSize = useWindowSize();
  const animationId = useRef(null);
  const themeRef = useRef(theme);

  // Keep theme ref in sync without re-triggering animation effect
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Initialize particles
  const initParticles = useCallback((width, height) => {
    const list = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: randomBetween(-PARTICLE_SPEED, PARTICLE_SPEED),
        vy: randomBetween(-PARTICLE_SPEED, PARTICLE_SPEED),
      });
    }
    return list;
  }, []);

  // Main animation loop using Canvas 2D — works everywhere, no WebGL needed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Only create particles once, or if they don't exist yet
    if (particles.current.length === 0) {
      particles.current = initParticles(width, height);
    }

    const pts = particles.current;

    const draw = () => {
      const isDark = themeRef.current === 'dark';
      const dotColor = isDark ? 'rgba(94, 232, 250, 0.9)' : 'rgba(2, 132, 199, 0.9)';
      const lineColorBase = isDark ? [94, 232, 250] : [2, 132, 199];

      ctx.clearRect(0, 0, width, height);

      // Update positions
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Clamp to bounds
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      // Draw lines between close particles
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = CONNECT_DISTANCE * CONNECT_DISTANCE;

          if (distSq < maxDistSq) {
            const opacity = 1 - Math.sqrt(distSq) / CONNECT_DISTANCE;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${lineColorBase[0]}, ${lineColorBase[1]}, ${lineColorBase[2]}, ${opacity * 0.25})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      ctx.fillStyle = dotColor;
      for (let i = 0; i < pts.length; i++) {
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId.current = requestAnimationFrame(draw);
    };

    if (!reduceMotion) {
      draw();
    } else {
      // Draw one static frame
      const isDark = themeRef.current === 'dark';
      const dotColor = isDark ? 'rgba(94, 232, 250, 0.9)' : 'rgba(2, 132, 199, 0.9)';
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = dotColor;
      for (let i = 0; i < pts.length; i++) {
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
        animationId.current = null;
      }
    };
  }, [reduceMotion, initParticles]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = windowSize;
    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    // Reposition particles that are now out of bounds
    const pts = particles.current;
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].x > width) pts[i].x = Math.random() * width;
      if (pts[i].y > height) pts[i].y = Math.random() * height;
    }
  }, [windowSize]);

  return (
    <Transition in timeout={3000} nodeRef={canvasRef}>
      {({ visible, nodeRef }) => (
        <canvas
          aria-hidden
          className={styles.canvas}
          data-visible={visible}
          ref={nodeRef}
          {...props}
        />
      )}
    </Transition>
  );
};
