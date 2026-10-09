import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const LOCALES = ["ar", "fr"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Locale redirection if missing locale prefix
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    const saved = req.cookies.get("locale")?.value;
    const locale = saved && LOCALES.includes(saved) ? saved : "ar";
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // 2. Refresh Supabase session cookies
  const { response } = await updateSession(req);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
