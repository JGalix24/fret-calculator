import { useEffect, useRef } from "react";

type Ripple = {
  x: number;
  y: number;
  startedAt: number;
  duration: number;
  maxRadius: number;
  hue: number; // 0 = blue, 1 = violet
};

const MAX_RIPPLES = 14;

export function WaterRipplesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const ripples: Ripple[] = [];
    let lastSpawn = 0;
    let nextSpawnDelay = 700;
    let rafId = 0;
    let running = true;

    const spawnRipple = (now: number) => {
      if (ripples.length >= MAX_RIPPLES) return;
      ripples.push({
        x: Math.random() * width,
        y: Math.random() * height,
        startedAt: now,
        duration: 2600 + Math.random() * 2200,
        maxRadius: 120 + Math.random() * 180,
        hue: Math.random(),
      });
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      if (now - lastSpawn > nextSpawnDelay) {
        spawnRipple(now);
        lastSpawn = now;
        nextSpawnDelay = 600 + Math.random() * 1600;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const t = (now - r.startedAt) / r.duration;
        if (t >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const ease = 1 - Math.pow(1 - t, 2);
        const radius = r.maxRadius * ease;
        const alpha = (1 - t) * 0.45;

        // 3 concentric rings, slightly offset
        for (let ring = 0; ring < 3; ring++) {
          const rOffset = ring * 14;
          const ringRadius = radius - rOffset;
          if (ringRadius <= 0) continue;
          const ringAlpha = alpha * (1 - ring * 0.28);

          // Blue → violet blend based on hue
          const isViolet = r.hue > 0.55;
          const stroke = isViolet
            ? `rgba(167, 139, 250, ${ringAlpha.toFixed(3)})` // violet-400
            : `rgba(96, 165, 250, ${ringAlpha.toFixed(3)})`; // blue-400

          ctx.beginPath();
          ctx.arc(r.x, r.y, ringRadius, 0, Math.PI * 2);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = stroke;
          ctx.stroke();
        }

        // Tiny center highlight (the drop impact)
        if (t < 0.18) {
          const centerAlpha = (1 - t / 0.18) * 0.55;
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220, 232, 255, ${centerAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      if (running) rafId = requestAnimationFrame(draw);
    };

    if (!reduced) {
      rafId = requestAnimationFrame(draw);
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!reduced && !running) {
        running = true;
        lastSpawn = performance.now();
        rafId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 0%, oklch(0.28 0.08 264 / 0.35), transparent 60%), radial-gradient(ellipse at 80% 100%, oklch(0.32 0.10 295 / 0.30), transparent 55%), linear-gradient(180deg, oklch(0.16 0.03 260) 0%, oklch(0.12 0.03 264) 100%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Soft top fade so the hero blends in */}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,24,40,0.9) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
