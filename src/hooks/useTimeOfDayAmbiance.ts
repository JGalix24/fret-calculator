import { useEffect, useState } from "react";

export type Ambiance = {
  key: "dawn" | "day" | "golden" | "night";
  label: string;
  /** CSS gradient applied as overlay on top of the hero video */
  gradient: string;
  /** CSS filter applied to the hero video itself */
  videoFilter: string;
  /** Color of the sun/moon disk */
  sunColor: string;
  /** Glow halo around the sun/moon */
  sunGlow: string;
  /** Vertical position of the sun/moon (% from top) */
  sunY: number;
  /** Horizontal position (% from left) */
  sunX: number;
  /** Whether to render stars */
  stars: boolean;
  /** Foreground text color hint */
  textShadow: string;
};

const DAWN: Ambiance = {
  key: "dawn",
  label: "Aube",
  gradient:
    "linear-gradient(180deg, rgba(180,200,220,0.55) 0%, rgba(120,150,180,0.35) 45%, rgba(60,80,110,0.25) 100%)",
  videoFilter: "brightness(0.82) saturate(0.7) contrast(0.95)",
  sunColor: "rgba(255, 220, 180, 0.95)",
  sunGlow: "0 0 80px 30px rgba(255, 200, 150, 0.45)",
  sunY: 38,
  sunX: 72,
  stars: false,
  textShadow: "0 2px 20px rgba(0,0,0,0.4)",
};

const DAY: Ambiance = {
  key: "day",
  label: "Plein jour",
  gradient:
    "linear-gradient(180deg, rgba(120,170,220,0.30) 0%, rgba(60,120,180,0.18) 50%, rgba(20,60,110,0.30) 100%)",
  videoFilter: "brightness(1.05) saturate(1.18) contrast(1.05)",
  sunColor: "rgba(255, 250, 235, 1)",
  sunGlow: "0 0 100px 40px rgba(255, 250, 200, 0.55)",
  sunY: 18,
  sunX: 78,
  stars: false,
  textShadow: "0 2px 20px rgba(0,0,0,0.55)",
};

const GOLDEN: Ambiance = {
  key: "golden",
  label: "Golden hour",
  gradient:
    "linear-gradient(180deg, rgba(255, 140, 60, 0.55) 0%, rgba(255, 100, 80, 0.35) 40%, rgba(120, 50, 80, 0.45) 100%)",
  videoFilter: "brightness(0.95) saturate(1.25) contrast(1.05) sepia(0.18) hue-rotate(-8deg)",
  sunColor: "rgba(255, 180, 100, 1)",
  sunGlow: "0 0 140px 60px rgba(255, 140, 60, 0.7)",
  sunY: 55,
  sunX: 70,
  stars: false,
  textShadow: "0 2px 24px rgba(60,20,0,0.5)",
};

const NIGHT: Ambiance = {
  key: "night",
  label: "Nuit",
  gradient:
    "linear-gradient(180deg, rgba(8, 18, 40, 0.78) 0%, rgba(15, 30, 60, 0.65) 50%, rgba(5, 10, 25, 0.85) 100%)",
  videoFilter: "brightness(0.42) saturate(0.6) contrast(1.1) hue-rotate(220deg)",
  sunColor: "rgba(230, 235, 255, 0.95)",
  sunGlow: "0 0 60px 25px rgba(180, 200, 255, 0.35)",
  sunY: 22,
  sunX: 75,
  stars: true,
  textShadow: "0 2px 24px rgba(0,0,0,0.7)",
};

export function ambianceForHour(h: number): Ambiance {
  if (h >= 5 && h < 8) return DAWN;
  if (h >= 8 && h < 16) return DAY;
  if (h >= 16 && h < 20) return GOLDEN;
  return NIGHT;
}

export function useTimeOfDayAmbiance(): Ambiance {
  const [ambiance, setAmbiance] = useState<Ambiance>(() => ambianceForHour(new Date().getHours()));

  useEffect(() => {
    const update = () => setAmbiance(ambianceForHour(new Date().getHours()));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return ambiance;
}
