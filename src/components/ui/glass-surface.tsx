"use client";

import { forwardRef, type HTMLAttributes, type ElementType } from "react";
import { cn } from "@/lib/utils";

type GlassTier = "thin" | "regular" | "thick";

interface GlassSurfaceProps extends HTMLAttributes<HTMLElement> {
  tier?: GlassTier;
  radius?: number | string;
  tint?: string;
  rim?: boolean;
  as?: ElementType;
}

const TIER_TOKENS: Record<GlassTier, { blur: number; fill: string }> = {
  thin: { blur: 16, fill: "rgba(28,30,32,0.40)" },
  regular: { blur: 24, fill: "rgba(28,30,32,0.55)" },
  thick: { blur: 40, fill: "rgba(28,30,32,0.70)" },
};

export const GlassSurface = forwardRef<any, GlassSurfaceProps>(
  function GlassSurface(
    {
      tier = "regular",
      radius = 999,
      tint,
      rim = true,
      as: Tag = "div",
      className,
      style,
      children,
      ...rest
    },
    ref
  ) {
    const { blur, fill } = TIER_TOKENS[tier];
    const radiusValue =
      typeof radius === "number" ? `${radius}px` : radius;

    return (
      <Tag
        ref={ref}
        className={cn("glass-surface relative isolate overflow-hidden", className)}
        style={{
          background: tint ?? fill,
          borderRadius: radiusValue,
          backdropFilter: `blur(${blur}px) saturate(180%) brightness(1.05)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(180%) brightness(1.05)`,
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.22)",
            "inset 0 -1px 0 rgba(0,0,0,0.28)",
            "0 8px 32px rgba(0,0,0,0.35)",
          ].join(", "),
          ...style,
        }}
        {...rest}
      >
        {rim && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: "inherit",
              padding: "1px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.18))",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        )}
        {children}
      </Tag>
    );
  }
);