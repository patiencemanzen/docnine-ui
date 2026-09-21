import { useEffect } from "react";

export function useGradientExpand(ids: readonly string[]) {
  const key = ids.join("|");

  useEffect(() => {
    const wraps = key
      .split("|")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (!wraps.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      wraps.forEach((wrap) => {
        wrap.style.maxWidth = "100vw";
        const box = wrap.querySelector(":scope > div") as HTMLElement | null;
        if (box) box.style.borderRadius = "0";
      });
      return;
    }

    const targetMaxWidth = 1152;

    const update = () => {
      const scrollY = window.scrollY;
      const vw = window.innerWidth;
      wraps.forEach((wrap) => {
        const box = wrap.querySelector(":scope > div") as HTMLElement | null;
        if (!box) return;
        const elTop = wrap.offsetTop;
        const startScroll = Math.max(0, elTop - window.innerHeight);
        const endScroll = elTop;
        const range = Math.max(1, endScroll - startScroll);
        const progress = Math.min(1, Math.max(0, (scrollY - startScroll) / range));
        const currentWidth = targetMaxWidth + (vw - targetMaxWidth) * progress;
        wrap.style.maxWidth = `${currentWidth}px`;
        wrap.style.marginLeft = "auto";
        wrap.style.marginRight = "auto";
        box.style.borderRadius = `${(1 - progress) * 16}px`;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [key]);
}
