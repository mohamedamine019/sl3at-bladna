import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // If Supabase credentials are missing, pass through
  if (!url || !anonKey) {
    return { response, user: null, supabase: null };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Cryptographically verify JWT user token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected Route Guards for /dashboard
  if (pathname.includes("/dashboard")) {
    if (!user) {
      // Extract locale from pathname (e.g., /ar/dashboard/vendor -> ar)
      const locale = pathname.split("/")[1] || "ar";
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/login`;
      loginUrl.searchParams.set("redirect", pathname);
      return { response: NextResponse.redirect(loginUrl), user: null, supabase };
    }

    // Server-side Role-Based Access Control (RBAC)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || "buyer";

    if (pathname.includes("/dashboard/vendor") && !["seller", "admin", "support"].includes(userRole)) {
      const locale = pathname.split("/")[1] || "ar";
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/dashboard/client`;
      return { response: NextResponse.redirect(redirectUrl), user, supabase };
    }

    if (pathname.includes("/dashboard/support") && !["support", "admin"].includes(userRole)) {
      const locale = pathname.split("/")[1] || "ar";
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/dashboard/client`;
      return { response: NextResponse.redirect(redirectUrl), user, supabase };
    }
  }

  return { response, user, supabase };
}
