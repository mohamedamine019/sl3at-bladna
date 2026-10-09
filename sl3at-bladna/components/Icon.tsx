import { Wheat, Hand, Shirt, Home, Sparkles, Smartphone, Dumbbell, Baby, Package, type LucideProps } from "lucide-react";

const MAP = { wheat: Wheat, hand: Hand, shirt: Shirt, home: Home, sparkles: Sparkles, smartphone: Smartphone, dumbbell: Dumbbell, baby: Baby } as const;

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const C = (MAP as Record<string, typeof Package>)[name] ?? Package;
  return <C aria-hidden {...props} />;
}
