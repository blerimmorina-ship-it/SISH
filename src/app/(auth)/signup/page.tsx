import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { SignupForm } from "./signup-form";
import { SishLogo } from "@/components/brand/logo";

export const metadata = { title: "Regjistro klinikën" };

export default async function SignupPage() {
  const session = await getCurrentSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex aurora">
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10 flex items-center">
          <SishLogo />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Provë falas · 30 ditë
          </div>
          <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tight leading-[1.1]">
            <span className="text-gradient">Regjistro klinikën tuaj</span>
            <br />
            <span className="text-foreground/90">në më pak se 60 sekonda.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Të dhënat tuaja janë <strong className="text-foreground">të izoluara plotësisht</strong> — asnjë klinikë tjetër nuk mund t'i shohë. Plani Starter falas për 30 ditë, pa kartë krediti.
          </p>

          <ul className="space-y-2 pt-2">
            {[
              "Setup i menjëhershëm — pa instalim",
              "Të dhëna të enkriptuara në TLS 1.3",
              "Backup automatik ditor",
              "Mbështetje 24/7",
              "Mund të anulosh në çdo moment",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="h-5 w-5 rounded-full bg-success/15 flex items-center justify-center text-success">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          Tashmë keni llogari?{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">Kyçu këtu</Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <SishLogo />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-premium p-8">
            <div className="mb-6 space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">Krijo klinikën tënde</h2>
              <p className="text-sm text-muted-foreground">Hapi i parë — të dhënat e klinikës dhe administrator.</p>
            </div>
            <SignupForm />
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Duke u regjistruar ju pranoni{" "}
            <a className="underline-offset-4 hover:underline text-foreground" href="#">Termat</a> dhe{" "}
            <a className="underline-offset-4 hover:underline text-foreground" href="#">Privatësinë</a>.
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground lg:hidden">
            Tashmë keni llogari?{" "}
            <Link href="/login" className="text-foreground hover:underline">Kyçu këtu</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
