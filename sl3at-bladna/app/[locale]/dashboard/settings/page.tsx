"use client";

import { useState, useEffect } from "react";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { WILAYAS } from "@/lib/data/wilayas";
import { Settings, User, Phone, MapPin, Store, CheckCircle2, ShieldAlert, Save } from "lucide-react";

export default function SettingsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === "ar";
  const { user, profile, role, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaId, setWilayaId] = useState<number>(16);
  const [language, setLanguage] = useState<"ar" | "fr">("ar");

  // Seller fields
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [commercialRegister, setCommercialRegister] = useState("");
  const [sellerId, setSellerId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileAndStore = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const supabase = createClient();
        
        // 1. Load user profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (prof) {
          setFullName(prof.full_name || user.user_metadata?.full_name || "");
          setPhone(prof.phone || user.user_metadata?.phone || "");
          setWilayaId(prof.wilaya_id || 16);
          setLanguage(prof.language || "ar");
        } else {
          setFullName(user.user_metadata?.full_name || "");
          setPhone(user.user_metadata?.phone || "");
        }

        // 2. If seller, load store profile
        if (role === "seller") {
          const { data: store } = await supabase
            .from("sellers")
            .select("*")
            .eq("owner_id", user.id)
            .single();

          if (store) {
            setSellerId(store.id);
            setStoreName(store.store_name || "");
            setStoreDescription(store.description || "");
            setCommercialRegister(store.commercial_register || "");
          } else if (user.user_metadata?.store_name) {
            setStoreName(user.user_metadata.store_name);
            setCommercialRegister(user.user_metadata.commercial_register || "");
          }
        }
      } catch {
        // Fallback
      } finally {
        setFetching(false);
      }
    };

    loadProfileAndStore();
  }, [user, role]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const supabase = createClient();

      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: phone,
          wilaya_id: wilayaId,
          language: language,
        });

      if (profileError) throw profileError;

      // 2. If seller, update sellers table
      if (role === "seller") {
        if (sellerId) {
          const { error: sellerError } = await supabase
            .from("sellers")
            .update({
              store_name: storeName,
              description: storeDescription,
              commercial_register: commercialRegister,
              wilaya_id: wilayaId,
              phone: phone,
            })
            .eq("id", sellerId);

          if (sellerError) throw sellerError;
        } else {
          // Create seller record if missing
          const slug = storeName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `store-${user.id.slice(0, 6)}`;
          await supabase.from("sellers").insert({
            owner_id: user.id,
            store_name: storeName,
            slug,
            description: storeDescription,
            commercial_register: commercialRegister,
            wilaya_id: wilayaId,
            phone: phone,
          });
        }
      }

      // 3. Update user metadata in Supabase auth
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
          wilaya_id: wilayaId,
          store_name: role === "seller" ? storeName : undefined,
        },
      });

      await refreshProfile();
      setSuccessMsg(ar ? "تم حفظ التغييرات بنجاح!" : "Modifications enregistrées avec succès!");
    } catch (err: any) {
      setErrorMsg(err.message || (ar ? "حدث خطأ أثناء حفظ المعلومات" : "Erreur lors de la sauvegarde"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold">
        {ar ? "جاري تحميل البيانات الحقيقية..." : "Chargement des données..."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {ar ? "إعدادات الحساب والملف الشخصي" : "Paramètres du Compte"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {ar ? "تحديث معلوماتك الحقيقية المسجلة في Supabase" : "Mettre à jour vos informations réelles"}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2 font-semibold">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>{ar ? "المعلومات الشخصية" : "Informations Personnelles"}</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {ar ? "الاسم واللقب الحقيقي" : "Nom et Prénom"}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={ar ? "مثال: أحمد بوعلام" : "Ex: Ahmed Boualam"}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ar ? "رقم الهاتف" : "Téléphone"}
              </label>
              <input
                type="tel"
                required
                pattern="^0[567][0-9]{8}$"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0550123456"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ar ? "الولاية" : "Wilaya"}
              </label>
              <select
                value={wilayaId}
                onChange={(e) => setWilayaId(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm bg-white outline-none"
              >
                {WILAYAS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.id} - {ar ? w.ar : w.fr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Seller Specific Details */}
        {role === "seller" && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-blue-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" />
              <span>{ar ? "بيانات المتجر / الشركة" : "Informations de la Boutique"}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ar ? "اسم المتجر أو الشركة" : "Nom de la boutique"}
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={ar ? "مثال: حلويات قسنطينة التقليدية" : "Ex: Artisanat Oran"}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ar ? "وصف المتجر والنشاط" : "Description de la boutique"}
              </label>
              <textarea
                rows={3}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder={ar ? "اكتب نبذة مختصرة عن المنتجات والخدمات التي تقدمها..." : "Description..."}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ar ? "رقم السجل التجاري (RC)" : "Registre du Commerce (RC)"}
              </label>
              <input
                type="text"
                value={commercialRegister}
                onChange={(e) => setCommercialRegister(e.target.value)}
                placeholder="25/00-1234567B25"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none font-mono"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? (ar ? "جاري الحفظ..." : "Enregistrement...") : ar ? "حفظ التغييرات" : "Enregistrer"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
