import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";

export default function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === "ar";
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">{ar ? "قريبا" : "Bientôt disponible"}</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        {ar ? "هذه الصفحة تُفعّل في المرحلة 2 مع تسجيل الدخول وحسابات البائعين." : "Cette page sera activée en phase 2, avec la connexion et les comptes vendeurs."}
      </p>
      <Link href={`/${params.locale}`} className="btn-primary mt-6">{ar ? "العودة للرئيسية" : "Retour à l'accueil"}</Link>
    </div>
  );
}
