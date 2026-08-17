"use client";

import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ReviewsSection({ productId }: { productId: number }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Review[]>("/reviews", { params: { product_id: productId } });
      setReviews(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const submit = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      await apiFetch(`/reviews/products/${productId}`, {
        method: "POST",
        token: session.accessToken,
        body: JSON.stringify({ rating, comment: comment || null }),
      });
      toast.success("Review submitted");
      setComment("");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? String(err.detail) : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-ink-900">Reviews</h2>

      {session ? (
        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <div className="mb-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={`h-5 w-5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <Textarea
            rows={3}
            placeholder="Share your thoughts about this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button className="mt-2" size="sm" isLoading={submitting} onClick={submit}>
            Submit review
          </Button>
        </div>
      ) : (
        <p className="mb-6 text-sm text-gray-500">Sign in to leave a review.</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-gray-100 pb-4">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink-900">{r.user.full_name}</span>
                <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
