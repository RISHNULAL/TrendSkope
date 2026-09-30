import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050b15] text-white text-center">
      <div className="glass-card max-w-md w-full p-8 border border-white/10 rounded-2xl flex flex-col items-center shadow-2xl">
        <div className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-semibold bg-primary-coral/10 text-primary-coral border border-primary-coral/20 mb-6">
          Error 404
        </div>
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-orange via-primary-coral to-primary-pink mb-3">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
          The page or scenario you are looking for does not exist or has been moved in the TrendSkope platform.
        </p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white shadow-lg transition-transform hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </main>
  );
}
