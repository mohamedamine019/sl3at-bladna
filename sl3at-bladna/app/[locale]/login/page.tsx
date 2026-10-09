"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, ShieldAlert, ArrowRight, CheckCircle2, Mail } from "lucide-react";

export default function LoginPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === "ar";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUnconfirmed(false);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setIsUnconfirmed(true);
          setErrorMsg(
            ar
              ? "لم يتم تأكيد البريد الإلكتروني بعد. يرجى مراجعة بريدك الإلكتروني لتأكيده أو اضغط لإعادة إرسال الرابط."
              : "Email non confirmé. Veuillez vérifier votre boîte de réception ou cliquer pour renvoyer le lien."
          );
        } else {
          setErrorMsg(error.message);
        }
      } else if (data.session) {
        setSuccessMsg(ar ? "تم تسجيل الدخول بنجاح! جاري التوجيه..." : "Connexion réussie! Redirection...");
        const role = data.user.user_metadata?.role || "buyer";
        setTimeout(() => {
          if (role === "seller") router.push(`/${params.locale}/dashboard/vendor`);
          else if (role === "support" || role === "admin") router.push(`/${params.locale}/dashboard/support`);
          else router.push(`/${params.locale}/dashboard/client`);
        }, 800);
      }
    } catch {
      setErrorMsg(ar ? "حدث خطأ غير متوقع أثناء تسجيل الدخول" : "Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          ar
            ? "تم إعادة إرسال رابط التفعيل بنجاح! يرجى مراجعة علبة الوارد في بريدك."
            : "Lien de confirmation renvoyé avec succès! Veuillez vérifier votre boîte mail."
        );
      }
    } catch {
      setErrorMsg(ar ? "فشل إرسال رابط التفعيل" : "Échec de l'envoi du lien");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mb-3">
            <LogIn className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {ar ? "تسجيل الدخول إلى حسابك" : "Connexion à votre compte"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {ar ? "منصة سلعات بلادنا - التجارة بين ولايات الجزائر" : "Plateforme Sl3at Bladna - Commerce inter-wilayas"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {isUnconfirmed && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>
                  {resending
                    ? ar ? "جاري الإرسال..." : "Envoi en cours..."
                    : ar ? "إعادة إرسال رابط التفعيل للبريد" : "Renvoyer le lien de confirmation"}
                </span>
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {ar ? "كلمة المرور" : "Mot de passe"}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{ar ? "جاري الدخول..." : "Connexion..."}</span>
            ) : (
              <>
                <span>{ar ? "تسجيل الدخول" : "Se connecter"}</span>
                <ArrowRight className={`w-4 h-4 ${ar ? "rotate-180" : ""}`} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {ar ? "ليس لديك حساب؟" : "Vous n'avez pas de compte?"}{" "}
          <Link
            href={`/${params.locale}/register`}
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline"
          >
            {ar ? "إنشاء حساب جديد" : "Créer un compte"}
          </Link>
        </div>
      </div>
    </div>
  );
}
