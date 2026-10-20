import { cn } from "@/lib/utils";

export function NijiType({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const gem =
    size === "sm" ? "size-[5px]" : size === "lg" ? "size-[9px]" : "size-[7px]";
  return (
    <span
      className={cn(
        "relative inline-flex items-baseline font-medium tracking-[-0.03em] text-neutral-900",
        size === "sm" && "text-[15px]",
        size === "md" && "text-[17px]",
        size === "lg" && "text-[28px]",
        className,
      )}
      aria-label="niji"
    >
      n
      <span className="relative">
        ı
        <span
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[42%] rounded-full bg-[#FF9933]",
            gem,
          )}
        />
      </span>
      <span className="relative">
        ȷ
        <span
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[42%] rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
            gem,
          )}
        />
      </span>
      <span className="relative">
        ı
        <span
          className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[42%] rounded-full bg-[#138808]",
            gem,
          )}
        />
      </span>
    </span>
  );
}
