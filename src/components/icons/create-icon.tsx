import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

export type IconProps = Omit<ComponentPropsWithoutRef<"svg">, "ref" | "children"> & {
  size?: string | number;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
  color?: string;
};

export function createIcon(icon: IconSvgElement, displayName: string) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(
    (
      {
        className,
        size = 24,
        strokeWidth = 1.5,
        absoluteStrokeWidth,
        color = "currentColor",
        ...props
      },
      ref,
    ) => (
      <HugeiconsIcon
        ref={ref}
        icon={icon}
        size={size}
        strokeWidth={strokeWidth}
        absoluteStrokeWidth={absoluteStrokeWidth}
        color={color}
        className={className}
        {...props}
      />
    ),
  );

  Icon.displayName = displayName;
  return Icon;
}
