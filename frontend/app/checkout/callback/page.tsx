"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";

interface VerifyResponse {
  reference: string;
  status: string;
  order_status: string;
  order_number: string;
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
          <Spinner className="mb-4 h-10 w-10" />
        </div>
      }
    >
      <CheckoutCallbackContent />
    </Suspense>
  );
}

function CheckoutCallbackContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const reference = searchParams.get("reference");
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("Missing payment reference.");
      return;
    }

    let attempts = 0;
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await apiFetch<VerifyResponse>(`/payments/verify/${reference}`);
        if (cancelled) return;
        setResult(data);
        if (data.status === "pending" && attempts < 5) {
          attempts += 1;
          setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) setError("Could not verify payment. Please contact support with your reference.");
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
      {error ? (
        <>
          <XCircle className="mb-4 h-14 w-14 text-red-500" />
          <h1 className="mb-2 text-xl font-bold text-ink-900">Something went wrong</h1>
          <p className="mb-6 text-sm text-gray-500">{error}</p>
          <Link href="/products">
            <Button variant="outline">Back to shop</Button>
          </Link>
        </>
      ) : !result ? (
        <>
          <Spinner className="mb-4 h-10 w-10" />
          <h1 className="text-xl font-bold text-ink-900">Confirming your payment...</h1>
          <p className="mt-2 text-sm text-gray-500">Reference: {reference}</p>
        </>
      ) : result.status === "successful" ? (
        <>
          <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-500" />
          <h1 className="mb-2 text-xl font-bold text-ink-900">Payment successful</h1>
          <p className="mb-6 text-sm text-gray-500">
            Order <span className="font-medium text-ink-900">{result.order_number}</span> has been placed.
          </p>
          <div className="flex gap-3">
            <Link href={session ? `/orders/${result.order_number}` : `/track-order?order=${result.order_number}`}>
              <Button>View order</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">Continue shopping</Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <XCircle className="mb-4 h-14 w-14 text-red-500" />
          <h1 className="mb-2 text-xl font-bold text-ink-900">Payment not completed</h1>
          <p className="mb-6 text-sm text-gray-500">
            Your payment is {result.status}. If you were charged, contact support with reference {result.reference}.
          </p>
          <Link href="/cart">
            <Button variant="outline">Back to cart</Button>
          </Link>
        </>
      )}
    </div>
  );
}
