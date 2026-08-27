import { redirect } from "next/navigation";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Sidebar } from "@/components/admin/Sidebar";
import { getSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 bg-gray-50 p-4 sm:p-6">
        <AdminTopbar />
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
