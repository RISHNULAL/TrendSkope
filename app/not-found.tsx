import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#E0E5EC] text-[#3D4852] text-center">
      <div className="glass-card max-w-md w-full p-8 border border-transparent rounded-2xl flex flex-col items-center shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]">
        <div className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold bg-primary-coral/10 text-[#6C63FF] border border-transparent mb-6">
          Error 404
        </div>
        <h1 className="text-6xl font-extrabold text-[#6C63FF] mb-3 font-display">
          404
        </h1>
        <h2 className="text-2xl font-bold text-[#3D4852] mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-[#6B7280] max-w-sm mb-8 leading-relaxed">
          The page or scenario you are looking for does not exist or has been moved in the TrendSkope platform.
        </p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-[#3D4852] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] transition-transform hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </main>
  );
}
