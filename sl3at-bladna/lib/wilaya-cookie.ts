import { cookies } from "next/headers";
import { wilayaById } from "./data/wilayas";

/** The visitor's chosen wilaya (set by <WilayaSelect/>), or null. Server-side only. */
export function getSelectedWilayaId(): number | null {
  const raw = cookies().get("wilaya")?.value;
  const id = raw ? parseInt(raw, 10) : NaN;
  return wilayaById(id) ? id : null;
}
