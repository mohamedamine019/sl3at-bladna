import { ar } from "./dictionaries/ar";
import { fr } from "./dictionaries/fr";
import type { Dictionary } from "./dictionaries/ar";

export const LOCALES = ["ar", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);
export const dir = (l: Locale) => (l === "ar" ? "rtl" : "ltr");

const dictionaries: Record<Locale, Dictionary> = { ar, fr };
export const getDictionary = (l: Locale): Dictionary => dictionaries[l];
