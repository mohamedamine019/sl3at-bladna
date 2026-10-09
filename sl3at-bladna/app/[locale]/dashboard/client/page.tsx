"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, MapPin, Heart, Clock, Truck, CreditCard, ChevronLeft, ChevronRight, Package, Inbox } from "lucide-react";
import { wilayaName } from "@/lib/data/wilayas";

export default function ClientDashboard({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === "ar";
  const { user, profile } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealClientData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchRealClientData();
  }, [user]);

  const shippedOrdersCount = orders.filter((o) => o.status === "shipped" || o.status === "out_for_delivery").length;

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">
          {ar
            ? `مرحباً بك ${profile?.fullName || user?.user_metadata?.full_name || ""} 🇩🇿`
            : `Bienvenue ${profile?.fullName || user?.user_metadata?.full_name || ""} 🇩🇿`}
        </h1>
        <p className="mt-2 text-emerald-100 text-sm max-w-2xl">
          {ar
            ? "هنا يمكنك متابعة طلبياتك بين الولايات، الاطلاع على حالة الشحن بالتفصيل، وإدارة عناوين التوصيل في الـ 58 ولاية."
            : "Suivez vos commandes inter-wilayas, consultez le statut de livraison et gérez vos adresses."}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{ar ? "إجمالي الطلبات الحقيقية" : "Commandes totales"}</p>
            <h3 className="text-2xl font-bold text-slate-900">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{ar ? "قيد الشحن الآن" : "En cours de livraison"}</p>
            <h3 className="text-2xl font-bold text-slate-900">{shippedOrdersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{ar ? "الولاية المسجلة" : "Wilaya"}</p>
            <h3 className="text-lg font-bold text-slate-900">
              {profile?.wilayaId ? `${profile.wilayaId} - ${wilayaName(profile.wilayaId, params.locale as any)}` : (ar ? "غير محدد" : "Non définie")}
            </h3>
          </div>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>{ar ? "سجل الطلبيات ومتابعة الشحن" : "Historique et Suivi des Commandes"}</span>
          </h2>
          <Link
            href={`/${params.locale}/products`}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>{ar ? "تصفح المنتجات" : "Explorer le catalogue"}</span>
            {ar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm font-medium">
            {ar ? "جاري تحميل الطلبات..." : "Chargement des commandes..."}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">{ar ? "لا توجد طلبيات مسجلة بعد" : "Aucune commande pour le moment"}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {ar ? "عندما تقوم بالشراء من أي متجر محلي عبر منصة سلعات بلادنا ستظهر طلبياتك وحالة شحنها هنا." : "Vos commandes apparaîtront ici."}
            </p>
            <Link
              href={`/${params.locale}/products`}
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              {ar ? "تصفح المنتجات والشراء الآن" : "Découvrir les produits"}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-slate-50/80 transition space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-base">{order.order_number || order.id}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {ar ? "تاريخ الطلب:" : "Date:"} <span className="font-medium text-slate-700">{new Date(order.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-lg font-extrabold text-slate-900">{(order.total_dzd || 0).toLocaleString()} د.ج</p>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{order.payment_method === "edahabia" ? "الذهبية (Edahbia)" : "الدفع عند الاستلام (COD)"}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
