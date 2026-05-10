import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen aurora">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            departmentName: user.department?.nameSq ?? null,
          }}
        />
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1920px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
