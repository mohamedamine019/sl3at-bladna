"use client";

import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import {
  Store,
  DollarSign,
  PackageCheck,
  TrendingUp,
  PlusCircle,
  Clock,
  CreditCard,
  Building2,
  CheckCircle,
  AlertCircle,
  Layers,
} from "lucide-react";

export default function VendorDashboard({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === "ar";

  const vendorProducts = [
    { id: "P-101", titleAr: "مقروض قسنطينة بالعسل واللوز", titleFr: "Makroudh de Constantine", priceDzd: 2800, stock: 45, sales: 120 },
    { id: "P-102", titleAr: "أواني نحاسية تقليدية منقوشة يدوياً", titleFr: "Artisanat Cuivre Ciselé", priceDzd: 18500, stock: 12, sales: 34 },
  ];

  const recentVendorOrders = [
    { id: "SB-0010482", buyer: "أحمد من وهران (31)", item: "مقروض قسنطينة (3 كغ)", totalDzd: 8500, status: "جاهز للشحن" },
    { id: "SB-0010479", buyer: "مريم من ورقلة (30)", item: "طقم أواني نحاسية", totalDzd: 18500, status: "تم الاستلام" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{ar ? "متجر موثق - 25 قسنطينة" : "Boutique Vérifiée - 25 Constantine"}</span>
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
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                {ar ? "باقة مجانية (المرحلة الأولى)" : "Offre Gratuite (Phase 1)"}
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-1 max-w-2xl">
              {ar
                ? "حالياً يمكنك عرض حتى 10 منتجات مجاناً بدون رسوم إيجار شهري. مع إمكانية الترقية مستقبلاً لباقة الإيجار الفضي أو الذهبي للحصول على منتجات غير محدودة ونسبة عمولة 0%."
                : "Affichez jusqu'à 10 produits gratuitement. Option de surclassement vers les offres Pro et Business."}
            </p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs transition shrink-0">
          {ar ? "تصفح باقات الإيجار" : "Voir les offres"}
        </button>
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
          <h3 className="text-2xl font-black text-slate-900 mt-2">1,240,000 د.ج</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ +14% مقارنة بالشهر الماضي</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{ar ? "الرصيد المتاح للسحب" : "Solde disponible"}</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">345,000 د.ج</h3>
          <p className="text-[11px] text-slate-400 mt-1">{ar ? "جاهز للسحب عبر CCP / RIB" : "Disponible via CCP/RIB"}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{ar ? "الطلبات المكتملة" : "Commandes livrées"}</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">154 طلب</h3>
          <p className="text-[11px] text-slate-400 mt-1">{ar ? "تغطية 42 ولاية" : "Couverture 42 wilayas"}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{ar ? "الرصيد المعلق (الضمان)" : "Solde en Séquestre"}</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">85,000 د.ج</h3>
          <p className="text-[11px] text-amber-600 font-medium mt-1">{ar ? "تحت التسليم للزبائن" : "En cours de livraison"}</p>
        </div>
      </div>

      {/* Recent Orders to Fulfill */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <span>{ar ? "طلبات تحتاج إلى معالجة وشحن" : "Commandes à traiter"}</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">2 جديدة</span>
        </div>

        <div className="divide-y divide-slate-100">
          {recentVendorOrders.map((ord) => (
            <div key={ord.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50">
              <div>
                <span className="font-extrabold text-slate-900 text-sm">{ord.id}</span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{ord.item}</p>
                <p className="text-xs text-slate-500">{ord.buyer}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-black text-slate-900 text-base">{ord.totalDzd.toLocaleString()} د.ج</span>
                <button className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm">
                  {ar ? "طباعة قسيمة الشحن Yalidine" : "Imprimer bordereau"}
                </button>
              </div>
            </div>
          ))}
        </div>
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
                ? "يمكنك تحويل رصيدك المتاح (345,000 د.ج) مباشرة إلى حسابك الجاري CCP أو الحساب البنكي BNA/BEA خلال 24 ساعة."
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
