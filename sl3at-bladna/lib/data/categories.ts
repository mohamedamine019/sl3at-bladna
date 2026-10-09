export interface Category { id: number; slug: string; ar: string; fr: string; icon: string }

export const CATEGORIES: Category[] = [
  { id: 1, slug: "food", ar: "مأكولات ومنتجات غذائية", fr: "Alimentation et terroir", icon: "wheat" },
  { id: 2, slug: "crafts", ar: "حرف وصناعات تقليدية", fr: "Artisanat", icon: "hand" },
  { id: 3, slug: "fashion", ar: "ملابس وأزياء", fr: "Mode et vêtements", icon: "shirt" },
  { id: 4, slug: "home", ar: "المنزل والديكور", fr: "Maison et déco", icon: "home" },
  { id: 5, slug: "beauty", ar: "جمال وعناية", fr: "Beauté et soins", icon: "sparkles" },
  { id: 6, slug: "electronics", ar: "إلكترونيات وإكسسوارات", fr: "Électronique", icon: "smartphone" },
  { id: 7, slug: "sports", ar: "رياضة وترفيه", fr: "Sport et loisirs", icon: "dumbbell" },
  { id: 8, slug: "kids", ar: "الأطفال والألعاب", fr: "Enfants et jeux", icon: "baby" },
];

export const categoryBySlug = (slug: string | undefined) => CATEGORIES.find((c) => c.slug === slug);
export const categoryById = (id: number) => CATEGORIES.find((c) => c.id === id);
