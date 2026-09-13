import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050b15] text-white text-center">
      <h1 className="text-6xl font-black text-primary-orange mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        The requested page or scenario does not exist in the TrendSkope dashboard.
      </p>
      <Link href="/" className="btn-primary">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
