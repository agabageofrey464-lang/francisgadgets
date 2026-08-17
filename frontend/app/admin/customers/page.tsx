"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Badge, Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import type { Page, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<Page<User> | null>(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      setData(await apiFetch<Page<User>>("/admin/customers", { token: session.accessToken, params: { q, page_size: 50 } }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Customers</h1>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search by name or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="max-w-xs"
        />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No customers yet.
                </td>
              </tr>
            ) : (
              data?.items.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone ?? "--"}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={u.is_active ? "success" : "danger"}>{u.is_active ? "Active" : "Disabled"}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
