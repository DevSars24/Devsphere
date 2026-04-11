import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion } from 'framer-motion';
import { useInViewport, useWindowSize } from '~/hooks';
import { useEffect, useRef } from 'react';
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
} from 'three';
import { cleanRenderer, cleanScene } from '~/utils/three';
import styles from './displacement-sphere.module.css';

const NUM_PARTICLES = 120;
const CONNECT_DISTANCE = 160;
const SPREAD = 700;

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
  const isInViewport = useInViewport(canvasRef);
  const windowSize = useWindowSize();
  const animationId = useRef();

  // Init scene
  useEffect(() => {
    const { innerWidth, innerHeight } = window;

    renderer.current = new WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.current.setSize(innerWidth, innerHeight);
    renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.current = new PerspectiveCamera(60, innerWidth / innerHeight, 1, 2000);
    camera.current.position.z = 600;

    scene.current = new Scene();

    // Create particle positions
    const positions = [];
    const particleList = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const x = randomBetween(-SPREAD / 2, SPREAD / 2);
      const y = randomBetween(-SPREAD / 2, SPREAD / 2);
      const z = randomBetween(-SPREAD / 2, SPREAD / 2);
      positions.push(x, y, z);
      particleList.push({
        x, y, z,
        vx: randomBetween(-0.15, 0.15),
        vy: randomBetween(-0.15, 0.15),
        vz: randomBetween(-0.08, 0.08),
      });
    }
    particles.current = particleList;

    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));

    const mat = new PointsMaterial({ size: 3, vertexColors: false, transparent: true, opacity: 0.9 });
    pointsMesh.current = new Points(geo, mat);
    scene.current.add(pointsMesh.current);

    // Lines mesh (updated each frame)
    const lineMat = new LineBasicMaterial({ transparent: true, opacity: 0.25, vertexColors: false });
    linesMesh.current = new LineSegments(new BufferGeometry(), lineMat);
    scene.current.add(linesMesh.current);

    return () => {
      cancelAnimationFrame(animationId.current);
      cleanScene(scene.current);
      cleanRenderer(renderer.current);
    };
  }, []);

  // Theme colors
  useEffect(() => {
    if (!pointsMesh.current || !linesMesh.current) return;
    const isDark = theme === 'dark';
    pointsMesh.current.material.color = new Color(isDark ? '#6ee7f7' : '#0284c7');
    linesMesh.current.material.color = new Color(isDark ? '#6ee7f7' : '#0284c7');
  }, [theme]);

  // Resize
  useEffect(() => {
    if (!renderer.current || !camera.current) return;
    const { width, height } = windowSize;

    if (width > 0 && height > 0) {
      renderer.current.setSize(width, height);
      camera.current.aspect = width / height;
      camera.current.updateProjectionMatrix();
    }
  }, [windowSize]);

  // Animate
  useEffect(() => {
    if (!renderer.current) return;

    const animate = () => {
      animationId.current = requestAnimationFrame(animate);

      const pts = particles.current;
      const posArray = new Float32Array(NUM_PARTICLES * 3);

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Bounce off walls
        if (Math.abs(p.x) > SPREAD / 2) p.vx *= -1;
        if (Math.abs(p.y) > SPREAD / 2) p.vy *= -1;
        if (Math.abs(p.z) > SPREAD / 2) p.vz *= -1;

        posArray[i * 3] = p.x;
        posArray[i * 3 + 1] = p.y;
        posArray[i * 3 + 2] = p.z;
      }

      pointsMesh.current.geometry.setAttribute('position', new Float32BufferAttribute(posArray, 3));

      // Build lines between close particles
      const linePositions = [];
      for (let i = 0; i < NUM_PARTICLES; i++) {
        for (let j = i + 1; j < NUM_PARTICLES; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dz = pts[i].z - pts[j].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < CONNECT_DISTANCE) {
            linePositions.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
          }
        }
      }

      linesMesh.current.geometry.setAttribute(
        'position',
        new BufferAttribute(new Float32Array(linePositions), 3)
      );

      renderer.current.render(scene.current, camera.current);
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else {
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
