import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SishLogo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center aurora p-6 text-center">
      <SishLogo />
      <div className="mt-12 mb-6">
        <div className="text-[120px] font-bold tracking-tight leading-none text-gradient">404</div>
        <h1 className="text-2xl font-bold tracking-tight mt-2">Faqja nuk u gjet</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Faqja që kërkove nuk ekziston ose është lëvizur. Provo të kthehesh në panel.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Kthehu mbrapa
          </Link>
        </Button>
        <Button variant="premium" size="sm" asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4" /> Paneli
          </Link>
        </Button>
      </div>
    </div>
  );
}
