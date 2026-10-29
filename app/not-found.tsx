import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F7FC] text-[#242137] text-center">
      <div className="glass-card max-w-md w-full p-8 border border-[#E7E3F0] bg-white rounded-2xl flex flex-col items-center shadow-card">
        <div className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#F0EBFF] text-[#6C4DFF] border border-[#6C4DFF]/20 mb-6">
          Error 404
        </div>
        <h1 className="text-6xl font-extrabold text-[#6C4DFF] mb-3 font-display tracking-tight">
          404
        </h1>
        <h2 className="text-2xl font-bold text-[#242137] mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-[#68677D] max-w-sm mb-8 leading-relaxed">
          The page or scenario you are looking for does not exist or has been moved in the TrendSkope platform.
        </p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </main>
  );
}
