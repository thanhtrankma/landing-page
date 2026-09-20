"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  colorIdx: number;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
};

type Ripple = { x: number; y: number; radius: number; maxRadius: number; alpha: number; speed: number };

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let frame = 0;
    let raf = 0;
    let running = true;

    // Light-only sky palette: soft blues that stay visible on white without competing with the content.
    const colors = {
      particles: ["rgba(11, 111, 164, ", "rgba(79, 179, 224, ", "rgba(143, 208, 238, ", "rgba(187, 228, 246, "],
      line: "rgba(79, 179, 224, ",
      glow: "rgba(187, 228, 246, 0.35)",
      ripple: "rgba(11, 111, 164, ",
    };

    let particles: Particle[] = [];
    const particleCount = () => (width < 640 ? 26 : width < 1024 ? 42 : 62);

    const seed = () => {
      particles = Array.from({ length: particleCount() }, () => {
        const r = Math.random() * 1.6 + 1.2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (reduceMotion ? 0.05 : 0.45),
          vy: (Math.random() - 0.5) * (reduceMotion ? 0.05 : 0.45),
          baseRadius: r,
          colorIdx: Math.floor(Math.random() * 4),
          alpha: Math.random() * 0.4 + 0.35,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      seed();
    };

    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false, radius: 170 };
    const onMove = (e: PointerEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouse.active = false;
    };

    const ripples: Ripple[] = [];
    const onDown = (e: PointerEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 0.35 * Math.min(width, height),
        alpha: 0.65,
        speed: 4.5,
      });
      if (ripples.length > 5) ripples.shift();
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    resize();

    const draw = () => {
      if (!running) return;
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius * 1.5);
        g.addColorStop(0, colors.glow);
        g.addColorStop(1, "rgba(0,0,0, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += rp.speed;
        rp.alpha *= 0.96;
        ctx.strokeStyle = `${colors.ripple}${rp.alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.stroke();
        for (const p of particles) {
          const dx = p.x - rp.x;
          const dy = p.y - rp.y;
          if (Math.abs(Math.sqrt(dx * dx + dy * dy) - rp.radius) < 30) {
            const angle = Math.atan2(dy, dx);
            p.vx += 0.15 * Math.cos(angle);
            p.vy += 0.15 * Math.sin(angle);
          }
        }
        if (rp.alpha < 0.01 || rp.radius > rp.maxRadius) ripples.splice(i, 1);
      }

      const linkDist = width < 640 ? 95 : 125;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const k = 1 - d / linkDist;
            ctx.strokeStyle = `${colors.line}${k * 0.3})`;
            ctx.lineWidth = 1.1 * k;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (mouse.active) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < mouse.radius) {
            const k = 1 - d / mouse.radius;
            ctx.strokeStyle = `${colors.line}${k * 0.42})`;
            ctx.lineWidth = 1.4 * k;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            if (d < 75 && !reduceMotion) {
              const push = (1 - d / 75) * 0.45;
              a.x += (dx / (d || 1)) * push;
              a.y += (dy / (d || 1)) * push;
            }
          }
        }
      }

      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.995;
          p.vy *= 0.995;
          if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.05;
          if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.05;
          if (p.x < -15) p.x = width + 15;
          if (p.x > width + 15) p.x = -15;
          if (p.y < -15) p.y = height + 15;
          if (p.y > height + 15) p.y = -15;
        }
        const pulse = Math.sin(frame * p.pulseSpeed + p.pulseOffset);
        const alpha = Math.max(0.15, p.alpha + 0.2 * pulse);
        const radius = p.baseRadius + 0.4 * pulse;
        const color = colors.particles[p.colorIdx];
        ctx.fillStyle = `${color}${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, radius), 0, Math.PI * 2);
        ctx.fill();
        if (p.baseRadius > 2) {
          ctx.fillStyle = `${color}${0.18 * alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.6 * radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="animated-bg-container" aria-hidden="true">
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />
      <div className="aurora-orb aurora-orb-4" />
      <div className="cyber-grid-overlay" />
      <canvas ref={canvasRef} className="animated-canvas" />
    </div>
  );
}
