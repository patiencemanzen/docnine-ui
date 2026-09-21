import { cn } from "@/lib/utils";
import { NoiseOverlay } from "@/components/ui/noise-overlay";

interface PremiumGreenBackdropProps {
  className?: string;
  grain?: "subtle" | "medium";
  forceDark?: boolean;
}

export function PremiumGreenBackdrop({
  className,
  grain = "medium",
  forceDark = false,
}: PremiumGreenBackdropProps) {
  const grainOpacity = grain === "medium" ? 0.18 : 0.1;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        forceDark && "dark",
        className,
      )}
      style={
        forceDark
          ? ({
              ["--hero-surface" as string]: "#020c0b",
              ["--hero-glow-a" as string]: "rgba(13, 148, 136, 0.28)",
              ["--hero-glow-b" as string]: "rgba(7, 74, 81, 0.55)",
              ["--hero-glow-c" as string]: "rgba(5, 40, 36, 0.5)",
              ["--hero-vignette" as string]: "rgba(1, 8, 7, 0.75)",
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className="absolute inset-0" style={{ backgroundColor: "var(--hero-surface)" }} />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 35%, var(--hero-glow-a) 0%, transparent 65%)",
        }}
      />

      <NoiseOverlay opacity={grainOpacity} blendMode="overlay" />
      <NoiseOverlay
        opacity={grainOpacity * 0.45}
        blendMode="soft-light"
        className="[background-size:160px_160px]"
      />
    </div>
  );
}
