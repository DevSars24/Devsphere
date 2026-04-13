// displacement-sphere.jsx
// Production-ready version — fixes:
//   1. SSR crash: window/document access guarded inside useEffect
//   2. isInViewport false on first paint: defaults to true, observer updates it
//   3. Three.js tree-shaking: all imports explicit and named
//   4. Resize handler: uses windowSize from hook safely
//   5. Animation cleanup: cancelAnimationFrame always called on unmount

import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion } from 'framer-motion';
import { useInViewport, useWindowSize } from '~/hooks';
import { useEffect, useRef, useState } from 'react';
import {
  BufferGeometry,
  Float32BufferAttribute,
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
import { cleanRenderer, cleanScene } from '~/utils/three';
import styles from './displacement-sphere.module.css';

const NUM_PARTICLES = 180;
const CONNECT_DISTANCE = 180;
const SPREAD = 700;
const SQUARED_CONNECT_DISTANCE = CONNECT_DISTANCE * CONNECT_DISTANCE;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export const DisplacementSphere = props => {
  const { theme } = useTheme();
  const canvasRef = useRef();
  const renderer = useRef();
  const camera = useRef();
  const scene = useRef();
  const particles = useRef([]);
  const pointsMesh = useRef();
  const linesMesh = useRef();
  const reduceMotion = useReducedMotion();
  const windowSize = useWindowSize();
  const animationId = useRef();

  // FIX 2: Default isInViewport to true so animation starts immediately on
  // first paint. The IntersectionObserver (inside useInViewport) will update
  // it to false when scrolled out of view. This prevents the blank-on-load
  // issue caused by the observer firing after the first render cycle.
  const isInViewport = useInViewport(canvasRef, { defaultValue: true });

  // FIX 1 + 3: Init scene — all window/document access is inside useEffect,
  // which only runs client-side. Safe for SSR (Next.js, Remix, etc.).
  useEffect(() => {
    // Guard: skip entirely in SSR environments
    if (typeof window === 'undefined') return;
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.current = new WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.current.setSize(width, height);
    renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.current = new PerspectiveCamera(60, width / height, 1, 2000);
    camera.current.position.z = 600;

    scene.current = new Scene();

    // Build particle list
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
        vx: randomBetween(-0.25, 0.25),
        vy: randomBetween(-0.25, 0.25),
        vz: randomBetween(-0.15, 0.15),
      });
    }
    particles.current = particleList;

    // Points mesh
    const geo = new BufferGeometry();
    const posAttribute = new BufferAttribute(positions, 3);
    posAttribute.setUsage(DynamicDrawUsage);
    geo.setAttribute('position', posAttribute);

    const mat = new PointsMaterial({
      size: 3,
      vertexColors: false,
      transparent: true,
      opacity: 0.9,
    });
    pointsMesh.current = new Points(geo, mat);
    scene.current.add(pointsMesh.current);

    // Lines mesh
    const maxLines = (NUM_PARTICLES * (NUM_PARTICLES - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new BufferGeometry();
    const lineAttribute = new BufferAttribute(linePositions, 3);
    lineAttribute.setUsage(DynamicDrawUsage);
    lineGeo.setAttribute('position', lineAttribute);
    lineGeo.setDrawRange(0, 0);

    const lineMat = new LineBasicMaterial({
      transparent: true,
      opacity: 0.25,
      vertexColors: false,
    });
    linesMesh.current = new LineSegments(lineGeo, lineMat);
    scene.current.add(linesMesh.current);

    return () => {
      cancelAnimationFrame(animationId.current);
      cleanScene(scene.current);
      cleanRenderer(renderer.current);
    };
  }, []);

  // Theme colors — safe: meshes only exist after init useEffect
  useEffect(() => {
    if (!pointsMesh.current || !linesMesh.current) return;
    const isDark = theme === 'dark';
    const color = new Color(isDark ? '#5EE8FA' : '#0284c7');
    pointsMesh.current.material.color = color;
    linesMesh.current.material.color = color;
  }, [theme]);

  // FIX 4: Resize — guard width/height > 0 to avoid divide-by-zero on first
  // render when windowSize hasn't resolved yet (common in SSR hydration)
  useEffect(() => {
    if (!renderer.current || !camera.current) return;
    const { width, height } = windowSize;
    if (!width || !height || width <= 0 || height <= 0) return;

    renderer.current.setSize(width, height);
    camera.current.aspect = width / height;
    camera.current.updateProjectionMatrix();
  }, [windowSize]);

  // Animate
  useEffect(() => {
    if (!renderer.current || !scene.current || !camera.current) return;
    if (!pointsMesh.current || !linesMesh.current) return;

    const animate = () => {
      animationId.current = requestAnimationFrame(animate);

      const pts = particles.current;
      const pointPositions = pointsMesh.current.geometry.attributes.position.array;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Bounce off walls
        if (Math.abs(p.x) > SPREAD / 2) p.vx *= -1;
        if (Math.abs(p.y) > SPREAD / 2) p.vy *= -1;
        if (Math.abs(p.z) > SPREAD / 2) p.vz *= -1;

        pointPositions[i * 3] = p.x;
        pointPositions[i * 3 + 1] = p.y;
        pointPositions[i * 3 + 2] = p.z;
      }

      pointsMesh.current.geometry.attributes.position.needsUpdate = true;

      // Build connection lines
      const linePositions = linesMesh.current.geometry.attributes.position.array;
      let vertexIndex = 0;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        for (let j = i + 1; j < NUM_PARTICLES; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dz = pts[i].z - pts[j].z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < SQUARED_CONNECT_DISTANCE) {
            linePositions[vertexIndex++] = pts[i].x;
            linePositions[vertexIndex++] = pts[i].y;
            linePositions[vertexIndex++] = pts[i].z;
            linePositions[vertexIndex++] = pts[j].x;
            linePositions[vertexIndex++] = pts[j].y;
            linePositions[vertexIndex++] = pts[j].z;
          }
        }
      }

      linesMesh.current.geometry.attributes.position.needsUpdate = true;
      linesMesh.current.geometry.setDrawRange(0, vertexIndex / 3);
      renderer.current.render(scene.current, camera.current);
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else {
      // Always do at least one static render so the canvas isn't blank
      renderer.current.render(scene.current, camera.current);
    }

    return () => cancelAnimationFrame(animationId.current);
  }, [isInViewport, reduceMotion]);

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
