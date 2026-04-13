import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion } from 'framer-motion';
import { useInViewport, useWindowSize } from '~/hooks';
import { useEffect, useRef } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';
import { cleanRenderer, cleanScene } from '~/utils/three';
import { throttle } from '~/utils/throttle';
import styles from './displacement-sphere.module.css';

// Particle config
const PARTICLE_COUNT = 180;
const CONNECTION_DISTANCE = 120;
const MOUSE_RADIUS = 150;
const PARTICLE_SPEED = 0.3;
const DEPTH_RANGE = 300;

// Generate a soft circular particle texture via canvas
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const loader = new TextureLoader();
  return loader.load(canvas.toDataURL());
}

export const DisplacementSphere = props => {
  const { theme } = useTheme();
  const canvasRef = useRef();
  const mouse = useRef(new Vector2(9999, 9999));
  const rendererRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();
  const particlesRef = useRef([]);
  const pointsRef = useRef();
  const linesRef = useRef();
  const reduceMotion = useReducedMotion();
  const isInViewport = useInViewport(canvasRef);
  const windowSize = useWindowSize();

  // Initialize scene
  useEffect(() => {
    const { innerWidth, innerHeight } = window;

    const renderer = new WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 1, 2000);
    camera.position.z = 400;
    cameraRef.current = camera;

    const scene = new Scene();
    sceneRef.current = scene;

    // Create particle data
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * innerWidth,
        y: (Math.random() - 0.5) * innerHeight,
        z: (Math.random() - 0.5) * DEPTH_RANGE,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED,
        vz: (Math.random() - 0.5) * PARTICLE_SPEED * 0.5,
        size: Math.random() * 3 + 1.5,
      });
    }
    particlesRef.current = particles;

    // Points geometry
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const alphas = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = particles[i].x;
      positions[i * 3 + 1] = particles[i].y;
      positions[i * 3 + 2] = particles[i].z;
      sizes[i] = particles[i].size;
      alphas[i] = Math.random() * 0.5 + 0.5;
    }

    const pointsGeometry = new BufferGeometry();
    pointsGeometry.setAttribute('position', new BufferAttribute(positions, 3));

    const texture = createParticleTexture();
    const pointsMaterial = new PointsMaterial({
      size: 4,
      map: texture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new Points(pointsGeometry, pointsMaterial);
    scene.add(points);
    pointsRef.current = points;

    // Lines geometry for connections
    const maxLines = PARTICLE_COUNT * PARTICLE_COUNT;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute('position', new Float32BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new LineBasicMaterial({
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });

    const lines = new LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
    linesRef.current = lines;

    return () => {
      cleanScene(scene);
      cleanRenderer(renderer);
    };
  }, []);

  // Update colors on theme change
  useEffect(() => {
    if (!pointsRef.current || !linesRef.current) return;

    if (theme === 'light') {
      pointsRef.current.material.color = new Color(0x1a1a2e);
      linesRef.current.material.color = new Color(0x1a1a2e);
      linesRef.current.material.opacity = 0.08;
      pointsRef.current.material.opacity = 0.5;
    } else {
      pointsRef.current.material.color = new Color(0x8ec5fc);
      linesRef.current.material.color = new Color(0x5e81ac);
      linesRef.current.material.opacity = 0.15;
      pointsRef.current.material.opacity = 0.7;
    }
  }, [theme]);

  // Handle resize
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;
    const { width, height } = windowSize;
    const adjustedHeight = height + height * 0.3;

    rendererRef.current.setSize(width, adjustedHeight);
    cameraRef.current.aspect = width / adjustedHeight;
    cameraRef.current.updateProjectionMatrix();

    if (reduceMotion) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [reduceMotion, windowSize]);

  // Mouse tracking
  useEffect(() => {
    const onMouseMove = throttle(event => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.current.x = event.clientX - rect.left - rect.width / 2;
      mouse.current.y = -(event.clientY - rect.top - rect.height / 2);
    }, 16);

    const onMouseLeave = () => {
      mouse.current.x = 9999;
      mouse.current.y = 9999;
    };

    if (!reduceMotion && isInViewport) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseleave', onMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isInViewport, reduceMotion]);

  // Animation loop
  useEffect(() => {
    let animation;
    const particles = particlesRef.current;

    const animate = () => {
      animation = requestAnimationFrame(animate);

      const positions = pointsRef.current.geometry.attributes.position.array;
      const { width, height } = windowSize;
      const halfW = width / 2;
      const halfH = (height + height * 0.3) / 2;

      // Update particle positions
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        // Mouse interaction — gentle repulsion
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * 0.4;
          p.vy += (dy / dist) * force * 0.4;
        }

        // Apply velocity with damping
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vz *= 0.98;

        // Clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz);
        if (speed > PARTICLE_SPEED * 3) {
          const scale = (PARTICLE_SPEED * 3) / speed;
          p.vx *= scale;
          p.vy *= scale;
          p.vz *= scale;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around edges
        if (p.x > halfW) p.x = -halfW;
        if (p.x < -halfW) p.x = halfW;
        if (p.y > halfH) p.y = -halfH;
        if (p.y < -halfH) p.y = halfH;
        if (p.z > DEPTH_RANGE / 2) p.z = -DEPTH_RANGE / 2;
        if (p.z < -DEPTH_RANGE / 2) p.z = DEPTH_RANGE / 2;

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;

      // Draw connections
      const linePositions = linesRef.current.geometry.attributes.position.array;
      let lineIndex = 0;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const ddx = particles[i].x - particles[j].x;
          const ddy = particles[i].y - particles[j].y;
          const ddz = particles[i].z - particles[j].z;
          const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);

          if (d < CONNECTION_DISTANCE) {
            linePositions[lineIndex++] = particles[i].x;
            linePositions[lineIndex++] = particles[i].y;
            linePositions[lineIndex++] = particles[i].z;
            linePositions[lineIndex++] = particles[j].x;
            linePositions[lineIndex++] = particles[j].y;
            linePositions[lineIndex++] = particles[j].z;
          }
        }
      }

      linesRef.current.geometry.attributes.position.needsUpdate = true;
      linesRef.current.geometry.setDrawRange(0, lineIndex / 3);

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else if (rendererRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    return () => {
      cancelAnimationFrame(animation);
    };
  }, [isInViewport, reduceMotion, windowSize]);

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