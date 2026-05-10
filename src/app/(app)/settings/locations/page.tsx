import { PageHeader } from "@/components/ui/page-header";
import { SettingsStub } from "@/components/ui/settings-stub";

export const metadata = { title: "Lokacionet" };

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Lokacionet" description="Klinika me shumë degë" />
      <SettingsStub
        title="Multi-lokacion"
        description="Aktivizo dhe menaxho më shumë degë në një llogari të vetme."
        features={[
          "Krijo dega/lokacione të reja me adresë dhe staf",
          "Lidh pacientët me lokacionin e tyre kryesor",
          "Filtra raporte sipas lokacionit",
          "Konfigurim i veçantë i orarit për çdo degë",
          "Staf i përbashkët ose i veçantë për dega",
        ]}
      />
    </div>
  );
}
