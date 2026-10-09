"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WILAYAS } from "@/lib/data/wilayas";
import { UserPlus, Store, ShoppingBag, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === "ar";
  const router = useRouter();

  const [accountType, setAccountType] = useState<"buyer" | "seller">("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [wilayaId, setWilayaId] = useState<number>(16); // Default 16 - Alger
  const [storeName, setStoreName] = useState("");
  const [commercialRegister, setCommercialRegister] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: accountType,
            full_name: fullName,
            phone: phone,
            wilaya_id: wilayaId,
            language: params.locale,
            store_name: accountType === "seller" ? storeName : undefined,
            commercial_register: accountType === "seller" ? commercialRegister : undefined,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          ar
            ? "تم إنشاء الحساب بنجاح! جاري إعداد لوحة التحكم..."
            : "Compte créé avec succès! Redirection..."
        );
        setTimeout(() => {
          if (accountType === "seller") router.push(`/${params.locale}/dashboard/vendor`);
          else router.push(`/${params.locale}/dashboard/client`);
        }, 1200);
      }
    } catch {
      setErrorMsg(ar ? "حدث خطأ غير متوقع أثناء التسجيل" : "Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mb-3">
            <UserPlus className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {ar ? "إنشاء حساب جديد" : "Créer un nouveau compte"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {ar ? "انضم إلى أكبر منصة تجارية عبر ولايات الجزائر" : "Rejoignez la plus grande plateforme d'Algérie"}
          </p>
        </div>

        {/* Role selector tab */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setAccountType("buyer")}
            className={`py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
              accountType === "buyer"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{ar ? "حساب مشتري (مستجوب)" : "Acheteur"}</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("seller")}
            className={`py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
              accountType === "seller"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{ar ? "حساب شركة / بائع" : "Vendeur / Entreprise"}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {ar ? "الاسم الكامل" : "Nom complet"}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={ar ? "محمد بن علي" : "Mohamed Benali"}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {ar ? "البريد الإلكتروني" : "Adresse email"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.dz"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {ar ? "رقم الهاتف (الجزائر)" : "Numéro de téléphone"}
              </label>
              <input
                type="tel"
                required
                pattern="^0[567][0-9]{8}$"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0550123456"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {ar ? "الولاية" : "Wilaya"}
              </label>
              <select
                value={wilayaId}
                onChange={(e) => setWilayaId(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm bg-white"
              >
                {WILAYAS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.id} - {ar ? w.ar : w.fr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {accountType === "seller" && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-3">
              <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                <Store className="w-4 h-4 text-blue-600" />
                <span>{ar ? "معلومات المتجر / الشركة" : "Informations de la boutique"}</span>
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {ar ? "اسم التجاري للمتجر أو الشركة" : "Nom de la boutique / entreprise"}
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={ar ? "مثال: مزارع الأوراس / حلويات قسنطينة" : "Ex: Artisanat Oran"}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {ar ? "رقم السجل التجاري (اختياري للتوثيق السريع)" : "Registre du Commerce (Optionnel)"}
                </label>
                <input
                  type="text"
                  value={commercialRegister}
                  onChange={(e) => setCommercialRegister(e.target.value)}
                  placeholder="23/00-1234567B16"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {ar ? "كلمة المرور" : "Mot de passe"}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 ${
              accountType === "seller"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
            }`}
          >
            {loading ? (
              <span>{ar ? "جاري الإنشاء..." : "Création..."}</span>
            ) : (
              <>
                <span>
                  {accountType === "seller"
                    ? ar
                      ? "تسجيل المتجر والبدء بالفترة المجانية"
                      : "Créer ma boutique"
                    : ar
                    ? "تسجيل الحساب"
                    : "Créer mon compte"}
                </span>
                <ArrowRight className={`w-4 h-4 ${ar ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {ar ? "لديك حساب بالفعل؟" : "Vous avez déjà un compte?"}{" "}
          <Link
            href={`/${params.locale}/login`}
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
          >
            {ar ? "تسجيل الدخول" : "Se connecter"}
          </Link>
        </div>
      </div>
    </div>
  );
}
