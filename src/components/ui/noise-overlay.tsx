import { cn } from "@/lib/utils";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`;

interface NoiseOverlayProps {
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  className?: string;
}

export function NoiseOverlay({
  opacity = 0.2,
  blendMode = "overlay",
  className,
}: NoiseOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none select-none absolute inset-0", className)}
      style={{
        backgroundImage: NOISE_SVG,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
        opacity,
        mixBlendMode: blendMode,
      }}
    />
  );
}
