"use client";

import { forwardRef, type ElementType, type HTMLAttributes, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

type GlassTier = "thin" | "regular" | "thick";

interface GlassSurfaceProps extends HTMLAttributes<HTMLElement> {
  tier?: GlassTier;
  radius?: number | string;
  tint?: string;
  rim?: boolean;
  interactive?: boolean;
  as?: ElementType;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GlassSurface = forwardRef<any, GlassSurfaceProps>(function GlassSurface(
  {
    tier = "regular",
    radius = 999,
    tint,
    rim = true,
    interactive = false,
    as: Tag = "div",
    className,
    style,
    children,
    onPointerMove,
    ...rest
  },
  ref
) {
  const move = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
    onPointerMove?.(e);
  };

  return (
    <Tag
      ref={ref}
      onPointerMove={move}
      className={cn("glass", `glass-${tier}`, !rim && "glass-norim", interactive && "glass-press", className)}
      style={{
        borderRadius: typeof radius === "number" ? `${radius}px` : radius,
        ...(tint ? ({ ["--glass-fill" as string]: tint } as React.CSSProperties) : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
});