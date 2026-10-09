import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-muted">الصفحة غير موجودة · Page introuvable</p>
      <Link href="/" className="btn-primary mt-6">سلعة بلادنا</Link>
    </div>
  );
}
