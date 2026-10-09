"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  Store,
  DollarSign,
  PackageCheck,
  TrendingUp,
  PlusCircle,
  Clock,
  Building2,
  CheckCircle,
  Layers,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { wilayaName } from "@/lib/data/wilayas";

export default function VendorDashboard({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === "ar";
  const { user } = useAuth();

  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const supabase = createClient();

        // 1. Fetch store info
        const { data: sellerData } = await supabase
          .from("sellers")
          .select("*")
          .eq("owner_id", user.id)
          .single();

        if (sellerData) {
          setSeller(sellerData);

          // 2. Fetch store products
          const { data: prods } = await supabase
            .from("products")
            .select("*")
            .eq("seller_id", sellerData.id)
            .order("created_at", { ascending: false });

          if (prods) setProducts(prods);

          // 3. Fetch store orders
          const { data: orderItems } = await supabase
            .from("order_items")
            .select("*, orders(*)")
            .eq("seller_id", sellerData.id)
            .order("delivered_at", { ascending: false });

          if (orderItems) setOrders(orderItems);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [user]);

  const totalSalesDzd = orders.reduce((sum, item) => sum + (item.unit_price_dzd * item.qty || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>
              {seller
                ? `${ar ? "متجر:" : "Boutique:"} ${seller.store_name} (${seller.wilaya_id} - ${wilayaName(seller.wilaya_id, params.locale as any)})`
                : (ar ? "حساب بائع تحت التوثيق" : "Compte Vendeur")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            {ar ? "لوحة تحكم الشركة / المتجر 🏬" : "Espace Vendeur & Entreprise 🏬"}
          </h1>
          <p className="mt-1 text-slate-300 text-sm max-w-xl">
            {ar
              ? "إدارة المبيعات عبر الولايات، تتبع المداخيل، وتحديث المنتجات والمخزون."
              : "Gérez vos ventes inter-wilayas, vos revenus et votre catalogue de produits."}
          </p>
        </div>

        <Link
          href={`/${params.locale}/sell`}
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{ar ? "إضافة منتج جديد" : "Ajouter un Produit"}</span>
        </Link>
      </div>

      {/* Subscription Rental Plan Card (نموذج إيجار المتجر) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-amber-950 text-base">
                {ar ? "حالة إيجار المتجر (Subscription Plan)" : "Statut d'Abonnement Boutique"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs capitalize">
                {seller?.plan_code || "Free Plan"}
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-1 max-w-2xl">
              {ar
                ? "حالياً يمكنك عرض المنتجات مجاناً. مع إمكانية الترقية مستقبلاً لباقة الإيجار الفضي أو الذهبي للحصول على منتجات غير محدودة ونسبة عمولة 0%."
                : "Affichez vos produits. Surclassement disponible."}
            </p>
          </div>
        </div>
        <Link
          href={`/${params.locale}/dashboard/settings`}
          className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs transition shrink-0"
        >
          {ar ? "تحديث بيانات المتجر" : "Gérer la boutique"}
        </Link>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{ar ? "إجمالي المبيعات" : "Ventes totales"}</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{totalSalesDzd.toLocaleString()} د.ج</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">{ar ? "مبيعات موثقة" : "Ventes réelles"}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{ar ? "عدد المنتجات المعروضة" : "Produits"}</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{products.length} {ar ? "منتج" : "produits"}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{ar ? "في الكتالوج" : "En catalogue"}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{ar ? "الطلبات المستلمة" : "Commandes"}</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{orders.length} {ar ? "طلب" : "commandes"}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{ar ? "حالة توثيق المتجر" : "Statut Verification"}</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-2 capitalize">{seller?.status || (ar ? "قيد المراجعة" : "En attente")}</h3>
        </div>
      </div>

      {/* Recent Orders to Fulfill */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <span>{ar ? "طلبات المتجر الحقيقية" : "Commandes réelles"}</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">{orders.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">{ar ? "جاري تحميل الطلبيات..." : "Chargement..."}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">{ar ? "لا توجد طلبيات مسجلة لمتجرك بعد" : "Aucune commande"}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm">{ord.title_snapshot}</span>
                  <p className="text-xs text-slate-500">{ar ? "الكمية:" : "Qté:"} {ord.qty}</p>
                </div>
                <span className="font-black text-slate-900 text-base">{(ord.unit_price_dzd * ord.qty).toLocaleString()} د.ج</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Request Section (CCP / RIB) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">
              {ar ? "سحب المستحقات المالية (CCP / RIB البنكي)" : "Demande de virement (CCP / RIB)"}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {ar
                ? "يمكنك تحويل رصيدك المتاح مباشرة إلى حسابك الجاري CCP أو الحساب البنكي BNA/BEA خلال 24 ساعة."
                : "Demandez le virement de votre solde disponible vers votre compte CCP ou bancaire."}
            </p>
          </div>
        </div>

        <button className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md shrink-0">
          {ar ? "طلب تحويل للأرباح" : "Demander un virement"}
        </button>
      </div>
    </div>
  );
}
