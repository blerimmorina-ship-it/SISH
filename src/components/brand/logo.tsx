import { cn } from "@/lib/utils";

export function SishLogo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-aurora opacity-50 blur-md" aria-hidden />
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative h-8 w-8"
          aria-hidden
        >
          <defs>
            <linearGradient id="sish-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="hsl(243 75% 59%)" />
              <stop offset="1" stopColor="hsl(160 84% 39%)" />
            </linearGradient>
            <linearGradient id="sish-glass" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="white" stopOpacity="0.25" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="32" height="32" rx="8" fill="url(#sish-grad)" />
          <rect x="0" y="0" width="32" height="32" rx="8" fill="url(#sish-glass)" />
          {/* Stylized cross + pulse */}
          <path
            d="M11 9.5h10M16 9.5v13M9 16h14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.95"
          />
          <circle cx="16" cy="22.5" r="1.5" fill="white" />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            SISH
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Health · Cloud
          </span>
        </div>
      )}
    </div>
  );
}
