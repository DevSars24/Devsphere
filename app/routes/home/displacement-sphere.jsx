import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion } from 'framer-motion';
import { useWindowSize } from '~/hooks';
import { useEffect, useRef } from 'react';
import {
  BufferGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
  Color,
  LineSegments,
  LineBasicMaterial,
  BufferAttribute,
  DynamicDrawUsage,
} from 'three';
import styles from './displacement-sphere.module.css';

// ─── CONFIG ─────────────────────────────────────────────────
const NUM_PARTICLES = 150;
const CONNECT_DISTANCE = 160;
const CONNECT_DISTANCE_SQ = CONNECT_DISTANCE * CONNECT_DISTANCE;
const SPREAD = 700;
const DOT_RADIUS = 1.5;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function getColor(theme) {
  return theme === 'dark' ? '#5EE8FA' : '#0284c7';
}

function getRgb(theme) {
  return theme === 'dark' ? [94, 232, 250] : [2, 132, 199];
}

// ─── STRATEGY 1: Three.js WebGL ──────────────────────────────
function tryInitWebGL(canvas, themeRef) {
  try {
    const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!testCtx) return null;

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const camera = new PerspectiveCamera(60, w / h, 1, 2000);
    camera.position.z = 600;
    const scene = new Scene();

    const positions = new Float32Array(NUM_PARTICLES * 3);
    const particleList = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const x = randomBetween(-SPREAD / 2, SPREAD / 2);
      const y = randomBetween(-SPREAD / 2, SPREAD / 2);
      const z = randomBetween(-SPREAD / 2, SPREAD / 2);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      particleList.push({
        x, y, z,
        vx: randomBetween(-0.2, 0.2),
        vy: randomBetween(-0.2, 0.2),
        vz: randomBetween(-0.1, 0.1),
      });
    }

    const pointGeo = new BufferGeometry();
    const pointAttr = new BufferAttribute(positions, 3);
    pointAttr.setUsage(DynamicDrawUsage);
    pointGeo.setAttribute('position', pointAttr);

    const baseColor = new Color(getColor(themeRef.current));
    const pointsMesh = new Points(
      pointGeo,
      new PointsMaterial({ size: 3, transparent: true, opacity: 0.9, color: baseColor })
    );
    scene.add(pointsMesh);

    const maxVerts = NUM_PARTICLES * (NUM_PARTICLES - 1);
    const linePositions = new Float32Array(maxVerts * 3);
    const lineGeo = new BufferGeometry();
    const lineAttr = new BufferAttribute(linePositions, 3);
    lineAttr.setUsage(DynamicDrawUsage);
    lineGeo.setAttribute('position', lineAttr);
    lineGeo.setDrawRange(0, 0);

    const linesMesh = new LineSegments(
      lineGeo,
      new LineBasicMaterial({ transparent: true, opacity: 0.25, color: baseColor })
    );
    scene.add(linesMesh);

    return {
      type: 'webgl',
      renderer, camera, scene, pointsMesh, linesMesh, particleList,
      animate() {
        const pts = this.particleList;
        const pArr = this.pointsMesh.geometry.attributes.position.array;
        for (let i = 0; i < NUM_PARTICLES; i++) {
          const p = pts[i];
          p.x += p.vx; p.y += p.vy; p.z += p.vz;
          if (Math.abs(p.x) > SPREAD / 2) p.vx *= -1;
          if (Math.abs(p.y) > SPREAD / 2) p.vy *= -1;
          if (Math.abs(p.z) > SPREAD / 2) p.vz *= -1;
          pArr[i * 3] = p.x; pArr[i * 3 + 1] = p.y; pArr[i * 3 + 2] = p.z;
        }
        this.pointsMesh.geometry.attributes.position.needsUpdate = true;

        const lArr = this.linesMesh.geometry.attributes.position.array;
        let vi = 0;
        for (let i = 0; i < NUM_PARTICLES; i++) {
          for (let j = i + 1; j < NUM_PARTICLES; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const dz = pts[i].z - pts[j].z;
            if (dx * dx + dy * dy + dz * dz < CONNECT_DISTANCE_SQ) {
              lArr[vi++] = pts[i].x; lArr[vi++] = pts[i].y; lArr[vi++] = pts[i].z;
              lArr[vi++] = pts[j].x; lArr[vi++] = pts[j].y; lArr[vi++] = pts[j].z;
            }
          }
        }
        this.linesMesh.geometry.attributes.position.needsUpdate = true;
        this.linesMesh.geometry.setDrawRange(0, vi / 3);
        this.renderer.render(this.scene, this.camera);
      },
      updateTheme(t) {
        const c = new Color(getColor(t));
        this.pointsMesh.material.color = c;
        this.linesMesh.material.color = c;
      },
      resize(w, h) {
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      },
      dispose() {
        this.pointsMesh.geometry.dispose();
        this.pointsMesh.material.dispose();
        this.linesMesh.geometry.dispose();
        this.linesMesh.material.dispose();
        this.renderer.dispose();
      },
    };
  } catch {
    return null;
  }
}

// ─── STRATEGY 2: Canvas 2D Fallback ─────────────────────────
function initCanvas2D(canvas, themeRef) {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const particleList = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particleList.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: randomBetween(-0.35, 0.35),
        vy: randomBetween(-0.35, 0.35),
      });
    }

    return {
      type: 'canvas2d',
      ctx, particleList, width: w, height: h, dpr,
      animate() {
        const { ctx: c, particleList: pts, width: W, height: H } = this;
        const rgb = getRgb(themeRef.current);
        c.clearRect(0, 0, W, H);
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 120 * 120) {
              const opacity = (1 - Math.sqrt(distSq) / 120) * 0.25;
              c.beginPath();
              c.moveTo(pts[i].x, pts[i].y);
              c.lineTo(pts[j].x, pts[j].y);
              c.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
              c.lineWidth = 0.6;
              c.stroke();
            }
          }
        }
        c.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.9)`;
        for (const p of pts) {
          c.beginPath();
          c.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
          c.fill();
        }
      },
      updateTheme() { },
      resize(w, h) {
        this.width = w; this.height = h;
        canvas.width = w * this.dpr;
        canvas.height = h * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
      },
      dispose() { },
    };
  } catch {
    return null;
  }
}

// ─── REACT COMPONENT ────────────────────────────────────────
export const DisplacementSphere = props => {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const windowSize = useWindowSize();
  const animationId = useRef(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    engineRef.current?.updateTheme(theme);
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Safety delay for Production
    const initTimer = setTimeout(() => {
      let engine = tryInitWebGL(canvas, themeRef);
      if (!engine) engine = initCanvas2D(canvas, themeRef);
      if (!engine) return;

      engineRef.current = engine;

      const handleContextLost = (e) => {
        e.preventDefault();
        cancelAnimationFrame(animationId.current);
        const fallback = initCanvas2D(canvas, themeRef);
        if (fallback) {
          engineRef.current = fallback;
          runLoop();
        }
      };

      if (engine.type === 'webgl') {
        canvas.addEventListener('webglcontextlost', handleContextLost);
      }

      function runLoop() {
        const tick = () => {
          if (!engineRef.current) return;
          try {
            engineRef.current.animate();
            animationId.current = requestAnimationFrame(tick);
          } catch (err) {
            console.warn("Switching to 2D Fallback", err);
            const fallback = initCanvas2D(canvas, themeRef);
            if (fallback) {
              engineRef.current = fallback;
              animationId.current = requestAnimationFrame(tick);
            }
          }
        };
        tick();
      }

      if (!reduceMotion) runLoop();
      else engine.animate();

    }, 150);

    return () => {
      clearTimeout(initTimer);
      if (animationId.current) cancelAnimationFrame(animationId.current);
      try { engineRef.current?.dispose(); } catch { }
      engineRef.current = null;
    };
  }, [reduceMotion]);

  useEffect(() => {
    const { width, height } = windowSize;
    if (width && height) engineRef.current?.resize(width, height);
  }, [windowSize]);

  return (
    <Transition in timeout={3000} nodeRef={canvasRef}>
      {({ visible, nodeRef }) => (
        <canvas
          aria-hidden
          className={styles.canvas}
          data-visible={visible}
          ref={nodeRef}
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 2s ease-in-out',
            pointerEvents: 'none' // Crucial: clicks project ke piche pass ho sakein
          }}
          {...props}
        />
      )}
    </Transition>
  );
};