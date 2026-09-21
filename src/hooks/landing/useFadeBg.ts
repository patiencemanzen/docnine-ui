import { useEffect } from "react";

export function useFadeBg() {
  useEffect(() => {
    const boxes = Array.from(document.querySelectorAll<HTMLElement>("[data-fade-bg]"));
    if (!boxes.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      boxes.forEach((box) => {
        const bg = box.querySelector<HTMLElement>("[data-fade-bg-layer]");
        if (bg) bg.style.opacity = "1";
      });
      return;
    }

    const update = () => {
      const vh = window.innerHeight;
      boxes.forEach((box) => {
        const bg = box.querySelector<HTMLElement>("[data-fade-bg-layer]");
        if (!bg) return;
        const rect = box.getBoundingClientRect();
        const start = rect.top;
        const end = rect.bottom;
        const progress = Math.min(1, Math.max(0, (vh - start) / Math.max(1, end - start)));
        bg.style.opacity = String(0.05 + progress * 0.95);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}
