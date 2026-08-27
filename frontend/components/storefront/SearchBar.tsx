"use client";

import { ChevronDown, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ProductThumb } from "@/components/storefront/ProductThumb";
import { apiFetch } from "@/lib/api";
import type { Category, Page, ProductListItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SearchBarProps {
  /** Populates the scope selector. Omit to search everything. */
  categories?: Category[];
  size?: "sm" | "md";
  className?: string;
  autoFocus?: boolean;
  /** Lets the mobile drawer close itself once a search is committed. */
  onSubmitted?: () => void;
}

const DEBOUNCE_MS = 250;
const MAX_SUGGESTIONS = 5;

export function SearchBar({ categories = [], size = "sm", className, autoFocus, onSubmitted }: SearchBarProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");
  const [scope, setScope] = useState("");
  const [suggestions, setSuggestions] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const stocked = categories.filter((c) => c.product_count > 0);

  // Reflect the active query back into the box. Read the URL directly rather
  // than useSearchParams() so the Navbar never forces pages out of static rendering.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue(params.get("q") ?? "");
    setScope(params.get("category") ?? "");
  }, []);

  // Live suggestions, debounced so typing does not hammer the API.
  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      apiFetch<Page<ProductListItem>>("/products", {
        params: { q: term, category_slug: scope || undefined, page_size: MAX_SUGGESTIONS },
      })
        .then((res) => setSuggestions(res.items))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, scope]);

  useEffect(() => {
    if (!open) return;

    const onClickAway = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickAway);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const resultsHref = (() => {
    const params = new URLSearchParams();
    const term = value.trim();
    if (term) params.set("q", term);
    if (scope) params.set("category", scope);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  })();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    inputRef.current?.blur();
    router.push(resultsHref);
    onSubmitted?.();
  };

  const showPanel = open && value.trim().length >= 2;

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={submit} role="search">
        <div
          className={`flex items-stretch overflow-hidden rounded-xl border-2 bg-white transition-colors ${
            open ? "border-brand-600" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          {stocked.length > 0 && (
            <div className="relative hidden shrink-0 border-r border-gray-200 lg:block">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                aria-label="Search within category"
                className="h-full cursor-pointer appearance-none bg-transparent py-2 pl-3 pr-7 text-xs font-medium text-gray-600 outline-none"
              >
                <option value="">All categories</option>
                {stocked.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
          )}

          <div className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="search"
              name="q"
              value={value}
              autoFocus={autoFocus}
              onChange={(e) => {
                setValue(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search phones, laptops, CCTV..."
              aria-label="Search products"
              className={`w-full bg-transparent pl-9 pr-8 text-ink-900 outline-none placeholder:text-gray-400 ${
                size === "md" ? "py-2.5 text-sm" : "py-2 text-sm"
              } [&::-webkit-search-cancel-button]:hidden`}
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-2 grid h-5 w-5 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-ink-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 sm:hidden" />}
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {loading && suggestions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Searching&hellip;</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              Nothing matches &ldquo;{value.trim()}&rdquo;.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {suggestions.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onSubmitted?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-brand-50"
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white">
                      <ProductThumb
                        image={product.images[0]}
                        name={product.name}
                        categorySlug={product.category?.slug}
                        sizes="44px"
                        patternId={`sugg-dots-${product.id}`}
                        className="object-contain p-1"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink-900">{product.name}</span>
                      {product.category && (
                        <span className="block truncate text-[11px] text-gray-400">{product.category.name}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-ink-900">
                      {formatCurrency(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={resultsHref}
            onClick={() => {
              setOpen(false);
              onSubmitted?.();
            }}
            className="block border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-center text-xs font-semibold text-brand-700 hover:bg-brand-50"
          >
            See all results for &ldquo;{value.trim()}&rdquo;
          </Link>
        </div>
      )}
    </div>
  );
}
