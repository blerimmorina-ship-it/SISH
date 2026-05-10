import { SishLogo } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center aurora">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-aurora animate-pulse-glow blur-xl" aria-hidden />
          <SishLogo showWordmark={false} className="relative" />
        </div>
        <div className="text-sm text-muted-foreground animate-pulse">Duke ngarkuar…</div>
      </div>
    </div>
  );
}
