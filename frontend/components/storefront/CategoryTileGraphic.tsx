import { Diagonals } from "@/components/ui/Pattern";
import { categoryIcon } from "@/lib/category-icons";

/** Drawn stand-in for a category that has no photo set on it. */
export function CategoryTileGraphic({ slug, name }: { slug: string; name: string }) {
  const Icon = categoryIcon(slug);

  return (
    <div className="relative h-full w-full overflow-hidden bg-brand-700">
      <div className="absolute inset-0 text-white/10">
        <Diagonals id={`tile-lines-${slug}`} className="h-full w-full" />
      </div>
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent-400/25 blur-lg" aria-hidden />
      <div className="relative grid h-full w-full place-items-center">
        <Icon className="h-8 w-8 text-white/90" aria-hidden />
      </div>
      <span className="sr-only">{name}</span>
    </div>
  );
}
