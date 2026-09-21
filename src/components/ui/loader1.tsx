import { cn } from "@/lib/utils";

type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<LoaderSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 48,
};

interface LoaderProps {
  size?: LoaderSize | number;

  color?: string;

  className?: string;

  label?: string;
}

export default function Loader1({ size = "lg", color, className, label = "Loading" }: LoaderProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const primaryColor = color || "var(--color-primary)";
  const dotSize = Math.max(px / 5, 4);

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <style>{`
                @keyframes apple-bounce {
                    0%, 80%, 100% {
                        transform: scale(0.6);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                .loader-dot {
                    width: ${dotSize}px;
                    height: ${dotSize}px;
                    border-radius: 50%;
                    background-color: ${primaryColor};
                    animation: apple-bounce 1.4s infinite ease-in-out both;
                }
                
                .loader-dot:first-child {
                    animation-delay: -0.32s;
                }
                
                .loader-dot:nth-child(2) {
                    animation-delay: -0.16s;
                }
            `}</style>

      <div className="loader-dot" />
      <div className="loader-dot" />
      <div className="loader-dot" />
    </div>
  );
}
