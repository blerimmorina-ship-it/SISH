import { Sparkles, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SettingsStub({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 p-3.5">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <Badge variant="default"><Sparkles className="h-3 w-3" /> Së shpejti</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="rounded-xl bg-muted/30 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Veçoritë e planifikuara</div>
              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
