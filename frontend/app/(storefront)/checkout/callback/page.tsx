"use client";

import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { CheckoutSteps } from "@/components/storefront/CheckoutSteps";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { CONTACT } from "@/lib/social";

interface VerifyResponse {
  reference: string;
  status: string;
  order_status: string;
  order_number: string;
}

/** One card shape for every outcome, so the page does not jump about as it resolves. */
function ResultCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 flex justify-center">
        <CheckoutSteps current={2} />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center sm:p-8">{children}</div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <ResultCard>
          <Spinner className="mx-auto mb-4 h-10 w-10" />
          <h1 className="text-lg font-bold text-ink-900">Loading...</h1>
        </ResultCard>
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

  if (error) {
    return (
      <ResultCard>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50">
          <XCircle className="h-7 w-7 text-red-500" />
        </span>
        <h1 className="mt-4 text-lg font-bold text-ink-900">Something went wrong</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-gray-500">{error}</p>
        {reference && (
          <p className="mt-3 font-mono text-xs text-gray-400">Reference: {reference}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={CONTACT.whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button>
              <MessageCircle className="h-4 w-4" />
              Contact support
            </Button>
          </a>
          <Link href="/products">
            <Button variant="outline">Back to shop</Button>
          </Link>
        </div>
      </ResultCard>
    );
  }

  if (!result) {
    return (
      <ResultCard>
        <Spinner className="mx-auto mb-4 h-10 w-10" />
        <h1 className="text-lg font-bold text-ink-900">Confirming your payment...</h1>
        <p className="mt-1.5 text-sm text-gray-500">This usually takes a few seconds.</p>
        <p className="mt-3 font-mono text-xs text-gray-400">Reference: {reference}</p>
      </ResultCard>
    );
  }

  if (result.status === "successful") {
    return (
      <ResultCard>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </span>
        <h1 className="mt-4 text-lg font-bold text-ink-900">Payment successful</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
          Order <span className="font-semibold text-ink-900">{result.order_number}</span> has been placed. We will
          confirm the delivery details with you shortly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={session ? `/orders/${result.order_number}` : `/track-order?order=${result.order_number}`}>
            <Button size="lg">View order</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg">
              Continue shopping
            </Button>
          </Link>
        </div>
      </ResultCard>
    );
  }

  return (
    <ResultCard>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50">
        <XCircle className="h-7 w-7 text-red-500" />
      </span>
      <h1 className="mt-4 text-lg font-bold text-ink-900">Payment not completed</h1>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-gray-500">
        Your payment is {result.status}. If you were charged, send us the reference below and we will sort it out.
      </p>
      <p className="mt-3 font-mono text-xs text-gray-400">Reference: {result.reference}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/cart">
          <Button>Back to cart</Button>
        </Link>
        <a href={CONTACT.whatsappLink} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <MessageCircle className="h-4 w-4" />
            Contact support
          </Button>
        </a>
      </div>
    </ResultCard>
  );
}
