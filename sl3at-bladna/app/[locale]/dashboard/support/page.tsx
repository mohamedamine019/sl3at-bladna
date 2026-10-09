"use client";

import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import {
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  XCircle,
  Headphones,
  FileText,
  AlertTriangle,
  UserCheck,
  Search,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export default function SupportDashboard({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const ar = params.locale === "ar";

  const pendingSellers = [
    { id: "S-991", storeName: "تمور زيبان التولقة", wilaya: "07 - بسكرة", rcNumber: "07/00-9876543A07", date: "2026-10-08" },
    { id: "S-992", storeName: "زربية غرداية ونسيج مزاب", wilaya: "47 - غرداية", rcNumber: "47/00-1122334B47", date: "2026-10-09" },
  ];

  const activeDisputes = [
    {
      id: "DSP-302",
      orderId: "SB-0010355",
      buyer: "كريم شريفي (الجزائر العاصمة)",
      seller: "فخار تيزي وزو التقليدي",
      reason: "تلف المنتوج أثناء الشحن بواسطة الناقل",
      amountDzd: 14500,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold mb-3 border border-amber-400/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{ar ? "لوحة إشراف فريق الدعم والوساطة" : "Espace Support & Modération"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            {ar ? "مركز التحكم والمراجعة 🛡️" : "Centre de Contrôle & Support 🛡️"}
          </h1>
          <p className="mt-1 text-amber-100 text-sm max-w-xl">
            {ar
              ? "مراجعة وثائق وتوثيق حسابات الشركات، حل النزاعات المالية والمبالغ المعلقة، وإدارة التذاكر."
              : "Vérifiez les registres du commerce des vendeurs et gérez les litiges clients."}
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{ar ? "طلبات توثيق متاجر معلقة" : "Boutiques en attente"}</p>
            <h3 className="text-2xl font-bold text-slate-900">2 {ar ? "طلبات" : "demandes"}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{ar ? "النزاعات المالية المفتوحة" : "Litiges ouverts"}</p>
            <h3 className="text-2xl font-bold text-slate-900">1 {ar ? "نزاع" : "litige"}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{ar ? "تذاكر الدعم النشطة" : "Tickets ouverts"}</p>
            <h3 className="text-2xl font-bold text-slate-900">4 {ar ? "تذاكر" : "tickets"}</h3>
          </div>
        </div>
      </div>

      {/* Pending Store Verification Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>{ar ? "مراجعة وتأكيد حسابات الشركات والسجل التجاري" : "Vérification des Boutiques & RC"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {ar ? "التأكد من وثائق الهوية والسجل التجاري قبل منح شارة التوثيق" : "Vérifiez le Registre du Commerce"}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {pendingSellers.map((s) => (
            <div key={s.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-extrabold text-slate-900 text-base">{s.storeName}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">{s.wilaya}</span>
                </div>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ar ? "رقم السجل التجاري:" : "N° RC:"} <strong className="font-mono text-slate-800">{s.rcNumber}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{ar ? "قبول وتفعيل المتجر" : "Approuver"}</span>
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition flex items-center justify-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>{ar ? "طلب توضيح" : "Rejeter"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escrow Disputes & Return Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>{ar ? "نزاعات الشراء والمبالغ المعلقة (Escrow Disputes)" : "Litiges de paiement et retours"}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {ar ? "التحكيم بين المشتري والبائع لإعادة الأموال أو إفراج المستحقات" : "Arbitrage des paiements bloqués"}
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {activeDisputes.map((dsp) => (
            <div key={dsp.id} className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{dsp.id}</span>
                    <span className="text-xs text-slate-400">({dsp.orderId})</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                      {ar ? "تحت المراجعة" : "En cours d'arbitrage"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-medium">
                    {ar ? "السبب:" : "Motif:"} {dsp.reason}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ar ? "المشتري:" : "Client:"} {dsp.buyer} | {ar ? "البائع:" : "Vendeur:"} {dsp.seller}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">{dsp.amountDzd.toLocaleString()} د.ج</span>
                  <p className="text-xs text-amber-600 font-semibold">{ar ? "المبلغ مجمد في الحساب المعلق" : "Montant Séquestré"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition">
                  {ar ? "إعادة المبلغ للمشتري (Refund)" : "Rembourser l'acheteur"}
                </button>
                <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition">
                  {ar ? "تحرير المبلغ للبائع (Release)" : "Libérer au vendeur"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
