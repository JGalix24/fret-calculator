import type { LandingSkin } from "@/lib/site-settings";

export function SkinToggle({ skin, onChange }: { skin: LandingSkin; onChange: (s: LandingSkin) => void }) {
  const set = (s: LandingSkin) => {
    try { localStorage.setItem("landing_skin_override", s); } catch {}
    onChange(s);
  };
  const base = "px-3 py-1.5 text-xs font-medium tracking-wide transition-colors";
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-0 rounded-full border border-black/15 bg-white/90 backdrop-blur shadow-lg overflow-hidden">
      <span className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-black/50 border-r border-black/10">Design</span>
      <button
        onClick={() => set("classic")}
        className={`${base} ${skin === "classic" ? "bg-black text-white" : "text-black/70 hover:text-black"}`}
        aria-pressed={skin === "classic"}
      >Classic</button>
      <button
        onClick={() => set("editorial")}
        className={`${base} ${skin === "editorial" ? "bg-[#FF4A1C] text-white" : "text-black/70 hover:text-black"}`}
        aria-pressed={skin === "editorial"}
      >Editorial</button>
    </div>
  );
}
