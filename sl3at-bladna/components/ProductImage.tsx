import { CategoryIcon } from "./Icon";
import { categoryById } from "@/lib/data/categories";

// No remote photos in the MVP: each product gets a calm tinted tile based on its category.
// Phase 2 replaces this with the seller's uploaded images from Supabase Storage.
const TINTS = ["#E6F1EA", "#EEF3E4", "#E3EFEF", "#F3EEE3", "#EAE9F3", "#F3E7E7", "#E4EEF5", "#EFEAF3"];

export function ProductImage({ categoryId, className = "" }: { categoryId: number; className?: string }) {
  const cat = categoryById(categoryId);
  return (
    <div
      className={`flex items-center justify-center text-brand/70 ${className}`}
      style={{ background: TINTS[(categoryId - 1) % TINTS.length] }}
      role="img"
      aria-label={cat?.fr ?? ""}
    >
      <CategoryIcon name={cat?.icon ?? "package"} className="h-1/3 w-1/3" strokeWidth={1.25} />
    </div>
  );
}
