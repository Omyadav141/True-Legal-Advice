"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  baseX: number;
  baseY: number;
  baseZ: number;
  x: number;
  y: number;
  z: number;
  opacity: number;
  size: number;
  phase: number;
  speed: number;
  waveAmp: number;
}

export default function OrganicParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const count = Math.min(1800, Math.floor((width * height) / 600));

    // Create organic flowing shape — lotus / plant-inspired parametric curves
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 6; // parametric angle
      const layer = Math.floor(Math.random() * 5); // depth layers
      const layerOffset = layer * 0.15;

      // Parametric petal / lotus curves
      const petalCount = 5 + Math.floor(Math.random() * 3);
      const r = 0.15 + 0.22 * Math.sin(petalCount * t) + layerOffset * 0.3;
      const spiralExpand = 1 + t * 0.012;

      const baseX = 0.55 + r * Math.cos(t) * spiralExpand * 0.65;
      const baseY = 0.45 + r * Math.sin(t) * spiralExpand * 0.55;
      const baseZ = (Math.sin(t * 0.5) * 0.5 + 0.5) * layer * 0.2;

      // Add organic scatter
      const scatter = 0.03 + Math.random() * 0.04;

      particles.push({
        baseX: baseX + (Math.random() - 0.5) * scatter,
        baseY: baseY + (Math.random() - 0.5) * scatter,
        baseZ: baseZ,
        x: 0,
        y: 0,
        z: 0,
        opacity: 0.15 + Math.random() * 0.65,
        size: 0.6 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.6,
        waveAmp: 0.005 + Math.random() * 0.02,
      });
    }

    // Add ambient scattered dots for atmosphere
    for (let i = 0; i < count * 0.3; i++) {
      particles.push({
        baseX: Math.random(),
        baseY: Math.random(),
        baseZ: Math.random() * 0.3,
        x: 0,
        y: 0,
        z: 0,
        opacity: 0.05 + Math.random() * 0.15,
        size: 0.4 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.3,
        waveAmp: 0.003 + Math.random() * 0.008,
      });
    }

    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);
      particlesRef.current = createParticles(width, height);
    }

    resize();
    window.addEventListener("resize", resize);

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / width,
        y: (e.clientY - rect.top) / height,
      };
    }
    canvas.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      time += 0.004;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Global organic rotation
      const globalRotX = Math.sin(time * 0.3) * 0.08;
      const globalRotY = Math.cos(time * 0.2) * 0.06;

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Wave-based organic movement
        const waveX = Math.sin(time * p.speed + p.phase) * p.waveAmp;
        const waveY = Math.cos(time * p.speed * 0.7 + p.phase * 1.3) * p.waveAmp;
        const waveZ = Math.sin(time * p.speed * 0.5 + p.phase * 0.8) * p.waveAmp * 0.5;

        // Apply subtle mouse influence
        const dx = p.baseX - mx;
        const dy = p.baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, 1 - dist * 4) * 0.015;

        p.x = p.baseX + waveX + globalRotY * (p.baseZ + 0.1) + dx * mouseInfluence;
        p.y = p.baseY + waveY + globalRotX * (p.baseZ + 0.1) + dy * mouseInfluence;
        p.z = p.baseZ + waveZ;

        // Depth-based scaling
        const depthScale = 0.7 + p.z * 0.6;
        const screenX = p.x * width;
        const screenY = p.y * height;
        const size = p.size * depthScale;

        // Skip particles outside visible area
        if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) continue;

        // Dynamic opacity with gentle pulse
        const pulse = 0.85 + 0.15 * Math.sin(time * p.speed * 2 + p.phase);
        const alpha = p.opacity * depthScale * pulse;

        // Color: blend between gold and warm white based on depth
        const goldFactor = Math.max(0, Math.min(1, p.z * 2 + 0.2));
        const r = Math.round(203 + (255 - 203) * (1 - goldFactor));
        const g = Math.round(167 + (250 - 167) * (1 - goldFactor));
        const b = Math.round(88 + (230 - 88) * (1 - goldFactor));

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Glow effect for brighter particles
        if (alpha > 0.35 && size > 1.2) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.12})`;
          ctx.fill();
        }
      }

      // Draw subtle connecting lines between nearby particles (sparse)
      const lineParticles = particles.slice(0, Math.min(particles.length, 400));
      for (let i = 0; i < lineParticles.length; i += 3) {
        for (let j = i + 3; j < lineParticles.length; j += 5) {
          const a = lineParticles[i];
          const b = lineParticles[j];
          const ddx = (a.x - b.x) * width;
          const ddy = (a.y - b.y) * height;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);

          if (d < 50) {
            const lineAlpha = (1 - d / 50) * 0.06;
            ctx.beginPath();
            ctx.moveTo(a.x * width, a.y * height);
            ctx.lineTo(b.x * width, b.y * height);
            ctx.strokeStyle = `rgba(203, 167, 88, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
