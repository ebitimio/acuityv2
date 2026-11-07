"use client";

import { useState } from "react";
import { findBrand, type BrandKind } from "@/lib/brands";
import { cn } from "@/lib/utils";

export function BrandLogo({
  name,
  kind,
  size = 40,
  className,
}: {
  name?: string | null;
  kind?: BrandKind;
  size?: number;
  className?: string;
}) {
  const brand = findBrand(name, kind);
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size, minWidth: size, minHeight: size, borderRadius: Math.round(size * 0.28) };

  if (!brand || failed) {
    const letter = (name?.trim()[0] ?? "?").toUpperCase();
    return (
      <span
        style={box}
        className={cn(
          "flex shrink-0 items-center justify-center bg-[var(--fill-2)] font-bold text-[var(--text-2)] shadow-xs select-none",
          className
        )}
      >
        {letter}
      </span>
    );
  }

  return (
    <span
      style={{ ...box, background: brand.bg ?? "#FFFFFF" }}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden p-[14%] shadow-xs select-none",
        className
      )}
    >
      <img
        src={brand.logo}
        alt={`${brand.name} logo`}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
