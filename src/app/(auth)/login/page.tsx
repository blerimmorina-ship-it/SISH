import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { SishLogo } from "@/components/brand/logo";

export const metadata = { title: "Kyçu" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getCurrentSession();
  if (session) redirect("/dashboard");
  const { from } = await searchParams;

  return (
    <div className="min-h-screen flex aurora">
      {/* Left panel — premium hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10 flex items-center">
          <SishLogo />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Platformë e re · v1.0
          </div>
          <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tight leading-[1.1]">
            <span className="text-gradient">Sistemi Informatik Shëndetësor</span>
            <br />
            <span className="text-foreground/90">për klinikën tuaj.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Menaxho pacientët, vizitat, laboratorin dhe faturimin nga një vend i vetëm —
            me siguri të nivelit ndërkombëtar dhe një ndërfaqe që e do.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Stat label="Modulet aktive" value="12" />
            <Stat label="Specialitete mjekësore" value="25+" />
            <Stat label="Uptime garantuar" value="99.95%" />
            <Stat label="Encryption në transit" value="TLS 1.3" />
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} SISH Health Cloud. Të gjitha të drejtat e rezervuara.
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <SishLogo />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-premium p-8">
            <div className="mb-6 space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">Mirë se erdhe</h2>
              <p className="text-sm text-muted-foreground">Kyçu në llogarinë tënde për të vazhduar.</p>
            </div>
            <LoginForm redirectTo={from ?? "/dashboard"} />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Duke u kyçur ju pranoni{" "}
            <a className="underline-offset-4 hover:underline text-foreground" href="#">
              Termat e Përdorimit
            </a>{" "}
            dhe{" "}
            <a className="underline-offset-4 hover:underline text-foreground" href="#">
              Politikën e Privatësisë
            </a>
            .
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Klinikë e re?{" "}
            <a className="text-primary font-medium hover:underline" href="/signup">
              Regjistrohu falas (30 ditë provë) →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4">
      <div className="text-2xl font-bold tracking-tight text-gradient">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
