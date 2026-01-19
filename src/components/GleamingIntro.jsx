import { useEffect, useRef, useState } from "react";
import "./gleamingIntro.css";

export default function GleamingIntro({ onFinish, enterDelayMs = 1000 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [showEnter, setShowEnter] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowEnter(true), enterDelayMs);
    return () => clearTimeout(t);
  }, [enterDelayMs]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!showEnter) return;
      if (e.key === "Enter" || e.key === " ") onFinish();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showEnter, onFinish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0;
    let h = 0;

    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function resize() {
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
    }

    // ==== USER TUNING ====
    const maxTrail = 90;
    const gap = 34;
    const SPEED_PX_PER_SEC = 620;

    // ✅ NEW: run the carve for 6 seconds, then exit + restart
    const RUN_DURATION_SEC = 6;

    // how long the screen stays totally clear before restarting
    // (set to 0 if you want immediate restart after leaving screen)
    const CLEAR_PAUSE_MS = 0;

    const fade = 0.10;

    // Prevent orbiting / circling in place
    let timeSinceTarget = 0;
    const TARGET_TIMEOUT_SEC = 1.2;

    // --- Color crossfade system (blue <-> pink) ---
    const colorA = [0, 201, 255];
    const colorB = [255, 0, 214];
    let colorMix = 0;
    let colorDir = 1;
    const COLOR_CYCLE_SECONDS = 5;

    function getCurrentColor(dt) {
      colorMix += (dt / COLOR_CYCLE_SECONDS) * colorDir;

      if (colorMix >= 1) {
        colorMix = 1;
        colorDir = -1;
      } else if (colorMix <= 0) {
        colorMix = 0;
        colorDir = 1;
      }

      const r = Math.round(colorA[0] + (colorB[0] - colorA[0]) * colorMix);
      const g = Math.round(colorA[1] + (colorB[1] - colorA[1]) * colorMix);
      const b = Math.round(colorA[2] + (colorB[2] - colorA[2]) * colorMix);

      return [r, g, b];
    }

    // --- Carve path state ---
    let head = { x: 0, y: 0 };
    let vel = { x: 1, y: 0 };
    let target = { x: 0, y: 0 };

    const trail = [];

    // Run controller
    let phase = "carve"; // "carve" -> "exit" -> "clear"
    let turnFlip = 1;
    let clearUntil = 0;

    // ✅ NEW: elapsed time in carve phase for the 6-second rule
    let runElapsed = 0;

    function hardClearScreen() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
    }

    function startNewRun() {
      phase = "carve";
      turnFlip = Math.random() < 0.5 ? -1 : 1;

      timeSinceTarget = 0;
      runElapsed = 0;

      // restart from the left (off-screen)
      head = {
        x: -w * 0.25,
        y: rand(h * 0.35, h * 0.65),
      };

      vel = { x: SPEED_PX_PER_SEC, y: 0 };

      trail.length = 0;
      hardClearScreen();
      pickNextCarveTarget();
    }

    function pickNextCarveTarget() {
      const minForward = w * 0.18;
      const maxForward = w * 0.42;

      const x = clamp(
        head.x + rand(minForward, maxForward),
        w * 0.15,
        w * 0.92
      );

      const center = h * 0.5;
      const band = h * 0.26;
      const y = clamp(
        center + turnFlip * rand(band * 0.35, band),
        h * 0.18,
        h * 0.82
      );

      target = { x, y };
      turnFlip *= -1;

      timeSinceTarget = 0;
    }

    function setExitTarget() {
      target = {
        x: Math.max(w * 1.35, head.x + w * 0.6),
        y: clamp(head.y + rand(-h * 0.05, h * 0.05), h * 0.15, h * 0.85),
      };
      phase = "exit";
      timeSinceTarget = 0;
    }

    function drawVignette() {
      const g = ctx.createRadialGradient(
        w * 0.55,
        h * 0.45,
        Math.min(w, h) * 0.1,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.8
      );
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    function stepMotion(dt) {
      // watchdog timers only apply during carve
      if (phase === "carve") {
        timeSinceTarget += dt;
        runElapsed += dt;

        // ✅ NEW: after 6 seconds, exit no matter what
        if (runElapsed >= RUN_DURATION_SEC) {
          setExitTarget();
        }
      }

      const dx = target.x - head.x;
      const dy = target.y - head.y;

      const dist = Math.hypot(dx, dy) || 1;
      const desiredDir = { x: dx / dist, y: dy / dist };

      const vmag = Math.hypot(vel.x, vel.y) || 1;
      const currentDir = { x: vel.x / vmag, y: vel.y / vmag };

      const steerPerSec = 3.0;
      const a = 1 - Math.exp(-steerPerSec * dt);

      const dir = {
        x: currentDir.x + (desiredDir.x - currentDir.x) * a,
        y: currentDir.y + (desiredDir.y - currentDir.y) * a,
      };

      const dmag = Math.hypot(dir.x, dir.y) || 1;
      dir.x /= dmag;
      dir.y /= dmag;

      vel.x = dir.x * SPEED_PX_PER_SEC;
      vel.y = dir.y * SPEED_PX_PER_SEC;

      head.x += vel.x * dt;
      head.y += vel.y * dt;

      if (phase === "carve") {
        head.x = clamp(head.x, -w * 0.4, w * 1.1);
        head.y = clamp(head.y, h * 0.1, h * 0.9);
      }

      if (phase === "carve" || phase === "exit") {
        trail.push({ x: head.x, y: head.y, vx: vel.x, vy: vel.y });
        while (trail.length > maxTrail) trail.shift();
      }

      // Reached target (only matters during carve)
      if (dist < 70 && phase === "carve") {
        timeSinceTarget = 0;
        pickNextCarveTarget();
      }

      // Watchdog against orbiting
      if (phase === "carve" && timeSinceTarget > TARGET_TIMEOUT_SEC) {
        pickNextCarveTarget();
      }

      // Exit completion: when fully off screen, clear and restart
      if (phase === "exit") {
        const offRight = head.x > w * 1.25;
        const offTop = head.y < -h * 0.2;
        const offBottom = head.y > h * 1.2;

        if (offRight || offTop || offBottom) {
          phase = "clear";
          clearUntil = performance.now() + CLEAR_PAUSE_MS;

          trail.length = 0;
          hardClearScreen();
        }
      }
    }

    function drawRails(color) {
      if (trail.length < 3) return;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let layer = 0; layer < 2; layer++) {
        const core = layer === 0;

        ctx.lineWidth = core ? 2.2 : 6.0;
        ctx.shadowBlur = core ? 18 : 32;

        const drawOneRail = (side) => {
          ctx.beginPath();

          for (let i = 0; i < trail.length; i++) {
            const p = trail[i];

            const tv = Math.hypot(p.vx, p.vy) || 1;
            const tx = p.vx / tv;
            const ty = p.vy / tv;

            const nx = -ty;
            const ny = tx;

            const t = i / (trail.length - 1);
            const taper = 0.25 + 0.75 * t;

            const off = (gap * 0.5) * taper * side;

            const x = p.x + nx * off;
            const y = p.y + ny * off;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          const a = core ? 0.75 : 0.22;
          const c = color;

          ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
          ctx.stroke();
        };

        drawOneRail(-1);
        drawOneRail(+1);
      }

      ctx.restore();
    }

    let lastTime = performance.now();

    function draw(now) {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (phase === "clear") {
        hardClearScreen();
        if (now >= clearUntil) startNewRun();
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const currentColor = getCurrentColor(dt);

      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, w, h);

      stepMotion(dt);
      drawRails(currentColor);
      drawVignette();

      rafRef.current = requestAnimationFrame(draw);
    }

    function onResize() {
      resize();
      startNewRun();
      lastTime = performance.now();
    }

    window.addEventListener("resize", onResize);

    // Init
    resize();
    startNewRun();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="gleam-intro">
      <canvas ref={canvasRef} className="gleam-canvas" aria-hidden="true" />

      <div className="gleam-titleWrap">
        <div className="gleam-title">SK8 OR DIE</div>
        <div className="gleam-sub">Workshop</div>

        <div className={`gleam-enterWrap ${showEnter ? "is-on" : ""}`}>
          <button className="gleam-enter" onClick={onFinish} type="button">
            ENTER
          </button>
        </div>
      </div>
    </div>
  );
}
