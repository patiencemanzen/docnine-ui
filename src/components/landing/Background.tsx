import React from "react";
import { cn } from "@/lib/utils";

type BackgroundProps = {
  children: React.ReactNode;
  variant?: "top" | "bottom";
  className?: string;
};

export function Background({ children, variant = "top", className }: BackgroundProps) {
  return (
    <div
      className={cn(
        "relative z-10 mx-2.5 overflow-hidden border border-border/60 bg-gray-900/50 lg:mx-4",
        variant === "top" && "rounded-t-4xl rounded-b-2xl",
        variant === "bottom" && "rounded-t-2xl rounded-b-4xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
