import React from "react"
import { cn } from "@/lib/utils"

type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl"

const SIZE_MAP: Record<LoaderSize, string> = {
  xs: "0.75rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
}

interface LoaderProps {
  
  size?: LoaderSize | string
  
  color?: string
  
  speed?: string
  
  className?: string
}

export default function Loader({
  size = "md",
  color,
  speed,
  className,
}: LoaderProps) {
  const resolvedSize =
    size in SIZE_MAP ? SIZE_MAP[size as LoaderSize] : size

  return (
    <span className="loader-c2"></span>
  )
}
