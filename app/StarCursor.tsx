"use client";

/**
 * StarCursor.tsx — Cosmic Star Trail Cursor
 *
 * A single <canvas> fixed over the entire viewport draws all particles
 * using requestAnimationFrame. No DOM element is created per particle —
 * everything lives in a plain JS array and is drawn with Canvas 2D API.
 *
 * Performance budget:
 * • Max 180 live particles at once (capped, oldest culled)
 * • Canvas cleared with a semi-transparent fill each frame → free motion blur
 * • All math is plain arithmetic — no trigonometric hotspots per frame
 * • The RAF loop is scheduled with { once: false } and cancelled on unmount
 * • Resize is debounced (100 ms) to avoid thrashing devicePixelRatio scaling
 *
 * Visual language (matches the Renaissance AI palette):
 * Gold   #c9a84c  — main dust, largest particles
 * White  #ffffff  — bright spark flares
 * Violet #a78bfa  — iridescent micro-dust
 * All particles spawn at the cursor, scatter with random velocity,
 * decelerate (drag 0.92), shrink, and fade over ~900 ms.
 */

import { useEffect, useRef } from "react";

// ─── Particle definition ──────────────────────────────────────────────────────
interface Particle {
  x:     number;   // current position
  y:     number;
  vx:    number;   // velocity (px/frame)
  vy:    number;
  size:  number;   // current radius (px)
  alpha: number;   // 0–1 opacity
  decay: number;   // alpha subtracted per frame
  shrink:number;   // size subtracted per frame
  color: string;   // CSS color string
  glow:  boolean;  // whether to draw a radial glow halo
}

// ─── Palette & spawn config ───────────────────────────────────────────────────
const COLORS = [
  { hex: "#c9a84c", weight: 5 },   // gold — dominant
  { hex: "#e8c97a", weight: 3 },   // light gold
  { hex: "#ffffff", weight: 2 },   // white spark
  { hex: "#a78bfa", weight: 2 },   // violet
  { hex: "#d4c8f0", weight: 1 },   // pale iris
];

// Weighted random colour pick
function pickColor(): string {
  const total  = COLORS.reduce((s, c) => s + c.weight, 0);
  let   roll   = Math.random() * total;
  for (const c of COLORS) {
    roll -= c.weight;
    if (roll <= 0) return c.hex;
  }
  return COLORS[0].hex;
}

const MAX_PARTICLES = 180;  // hard cap — keeps GPU compositing fast
const SPAWN_PER_MOVE = 4;   // particles per mousemove event

function createParticle(x: number, y: number): Particle {
  const angle  = Math.random() * Math.PI * 2;
  const speed  = 0.5 + Math.random() * 2.2;
  const isBig  = Math.random() < 0.18;   // ~18% chance of a larger "star"
  const color  = pickColor();

  return {
    x,
    y,
    vx:     Math.cos(angle) * speed,
    vy:     Math.sin(angle) * speed - 0.4, // slight upward bias (dust rises)
    size:   isBig ? 2.2 + Math.random() * 2.8 : 0.8 + Math.random() * 1.6,
    alpha:  0.75 + Math.random() * 0.25,
    decay:  isBig ? 0.012 + Math.random() * 0.008 : 0.018 + Math.random() * 0.014,
    shrink: isBig ? 0.025 + Math.random() * 0.015  : 0.04  + Math.random() * 0.02,
    color,
    glow:   isBig || Math.random() < 0.3,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StarCursor() {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const particles     = useRef<Particle[]>([]);
  const rafId         = useRef<number>(0);
  const mouse         = useRef({ x: -9999, y: -9999 });
  const resizeTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Size canvas to match viewport at device pixel ratio ──────────────────
    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2× for perf
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    }
    resize();

    const onResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(resize, 100);
    };

    // ── Track mouse ──────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Spawn a burst of particles at the cursor position
      const pool = particles.current;
      for (let i = 0; i < SPAWN_PER_MOVE; i++) {
        // Tiny jitter around cursor so they don't all stack on the same pixel
        const jx = mouse.current.x + (Math.random() - 0.5) * 6;
        const jy = mouse.current.y + (Math.random() - 0.5) * 6;
        pool.push(createParticle(jx, jy));
      }

      // Cull oldest when over cap — O(1) shift is fine at this cadence
      while (pool.length > MAX_PARTICLES) pool.shift();
    };

    // ── RAF draw loop ────────────────────────────────────────────────────────
    function draw() {
      rafId.current = requestAnimationFrame(draw);

      if (!ctx) return; // <--- INI PENGAMANNYA BIAR TYPESCRIPT DIEM

      const W = window.innerWidth;
      const H = window.innerHeight;

      // Clear with a very low-alpha black fill → creates a natural motion trail
      // that smears particles slightly before they fully fade. 
      // Using clearRect here instead of fillRect would make the trail abrupt.
      ctx.clearRect(0, 0, W, H);

      const pool = particles.current;

      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];

        // Physics
        p.x     += p.vx;
        p.y     += p.vy;
        p.vx    *= 0.92;      // drag
        p.vy    *= 0.92;
        p.vy    -= 0.015;     // gravity-less, but slight upward acceleration
        p.alpha -= p.decay;
        p.size  -= p.shrink;

        // Cull dead particles (iterate backwards so splice is safe)
        if (p.alpha <= 0 || p.size <= 0.05) {
          pool.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

        // ── Glow halo ──
        if (p.glow && p.size > 0.6) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          glow.addColorStop(0,   p.color + "88");   // hex with alpha — ~53%
          glow.addColorStop(0.4, p.color + "33");   // ~20%
          glow.addColorStop(1,   p.color + "00");   // transparent
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // ── Core particle dot ──
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.05, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.restore();
      }
    }

    // ── Listeners + kick off loop ─────────────────────────────────────────────
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize",    onResize, { passive: true });
    draw();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize",    onResize);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        9999,
        pointerEvents: "none",   // NEVER blocks clicks, scroll, or hover
        display:       "block",
      }}
    />
  );
}