"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** iOS-style switch (mint when on). Self-contained state; controlled optional. */
export function Toggle({
  defaultOn = false,
  onChange,
}: {
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        const n = !on;
        setOn(n);
        onChange?.(n);
      }}
      className={cn(
        "relative h-7 w-[46px] shrink-0 rounded-full transition-colors",
        on ? "bg-mint" : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all",
          on ? "left-[21px]" : "left-[3px]",
        )}
      />
    </button>
  );
}
