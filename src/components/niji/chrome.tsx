import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Raised({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("rounded-[18px] bg-[#F7F7F8]", className)}
      style={{
        borderTop: "1px solid rgba(255,255,255,0.92)",
        boxShadow: "0 4px 10px rgba(25,25,34,0.07)",
      }}
    >
      {children}
    </div>
  );
}

export function Groove({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("rounded-2xl bg-[#E1E1E3] px-4", className)}
      style={{
        borderTop: "1px solid rgba(23,23,26,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.85)",
      }}
    >
      {children}
    </div>
  );
}

export function Chip({
  on,
  children,
  className,
}: {
  on?: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (on) {
    return (
      <Raised className={cn("px-4 py-2", className)}>
        <span className="text-[12px] font-semibold text-[#17171A]">{children}</span>
      </Raised>
    );
  }
  return (
    <Groove className={cn("flex items-center py-2", className)}>
      <span className="text-[12px] text-[#65656B]">{children}</span>
    </Groove>
  );
}

export function IconHit({
  className,
  children,
  disabled,
}: {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        "grid size-9 place-items-center rounded-full bg-[#F7F7F8] text-[#17171A]",
        disabled && "opacity-25",
        className,
      )}
      style={{
        borderTop: "1px solid rgba(255,255,255,0.92)",
        boxShadow: "0 3px 8px rgba(25,25,34,0.08)",
      }}
    >
      {children}
    </span>
  );
}
