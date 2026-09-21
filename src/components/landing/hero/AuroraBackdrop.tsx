import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useHeroShader } from "./useHeroShader";

type AuroraBackdropProps = {
  variant?: "column" | "fill";
  className?: string;
};

export function AuroraBackdrop({ variant = "fill", className }: AuroraBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHeroShader(canvasRef);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-black", className)}
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 block h-full w-full" />
      <div
        className={cn(
          variant === "column" ? "hero-glass-panel" : "hero-glass-panel hero-glass-panel--fill",
        )}
      />
      <div className="hero-grain" />
    </div>
  );
}
