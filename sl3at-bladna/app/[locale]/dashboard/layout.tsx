"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  ShoppingBag,
  Store,
  ShieldAlert,
  User,
  LogOut,
  Package,
  Settings,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const ar = params.locale === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const { role, profile, user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push(`/${params.locale}/login`);
  };

  const isClient = pathname.includes("/dashboard/client");
  const isVendor = pathname.includes("/dashboard/vendor");
  const isSupport = pathname.includes("/dashboard/support");
  const isSettings = pathname.includes("/dashboard/settings");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Dashboard Header Brand */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-lg">
              SB
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                {ar ? "لوحة التحكم" : "Tableau de bord"}
              </h2>
              <p className="text-xs text-emerald-400 font-medium capitalize">
                {role === "seller"
                  ? ar ? "حساب بائع / شركة" : "Compte Vendeur"
                  : role === "support" || role === "admin"
                  ? ar ? "فريق الدعم / إشراف" : "Support & Admin"
                  : ar ? "حساب مشتري" : "Compte Client"}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            {/* Client / Buyer Links */}
            {(role === "buyer" || isClient) && (
              <>
                <Link
                  href={`/${params.locale}/dashboard/client`}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isClient ? "bg-emerald-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>{ar ? "طلباتي والشحن" : "Mes Commandes"}</span>
                </Link>
                <Link
                  href={`/${params.locale}/cart`}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{ar ? "سلة التسوق" : "Mon Panier"}</span>
                </Link>
              </>
            )}

            {/* Vendor / Seller Links */}
            {(role === "seller" || isVendor) && (
              <>
                <Link
                  href={`/${params.locale}/dashboard/vendor`}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isVendor ? "bg-blue-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>{ar ? "مبيعات وإحصائيات المتجر" : "Aperçu Vendeur"}</span>
                </Link>
                <Link
                  href={`/${params.locale}/sell`}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  <span>{ar ? "إضافة منتج جديد" : "Ajouter Produit"}</span>
                </Link>
              </>
            )}

            {/* Support / Admin Links */}
            {(role === "support" || role === "admin" || isSupport) && (
              <>
                <Link
                  href={`/${params.locale}/dashboard/support`}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isSupport ? "bg-amber-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span>{ar ? "إدارة وتوثيق الشركات" : "Centre Support & Admin"}</span>
                </Link>
              </>
            )}

            {/* Common Settings Link */}
            <Link
              href={`/${params.locale}/dashboard/settings`}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                isSettings ? "bg-slate-800 text-emerald-400 font-semibold border border-slate-700" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>{ar ? "إعدادات الحساب" : "Paramètres"}</span>
            </Link>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-6 border-t border-slate-800 mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.fullName || user?.user_metadata?.full_name || (ar ? "مستخدم سلعات بلادنا" : "Utilisateur SB")}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{ar ? "تسجيل الخروج" : "Déconnexion"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
