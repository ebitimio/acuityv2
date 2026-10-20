"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "./form";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fill-1)] text-[var(--text-3)]">
        <Icon size={26} />
      </div>
      <h3 className="text-[16px] font-bold text-[var(--text-1)]">{title}</h3>
      <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-[var(--text-2)]">{body}</p>
      {action && onAction && (
        <Button className="mt-5 !h-11 !w-auto px-6" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}