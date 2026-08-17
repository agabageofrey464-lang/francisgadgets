import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { getSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">My account</h1>

      <Card className="p-5">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-ink-900">{session?.user.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-ink-900">{session?.user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium capitalize text-ink-900">{session?.user.role}</dd>
          </div>
        </dl>
      </Card>

      <Link href="/orders" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
        View my orders &rarr;
      </Link>
    </div>
  );
}
