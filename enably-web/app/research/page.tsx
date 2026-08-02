import Nav from "@/components/gtm/Nav";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#0B1020]">
      <Nav />
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#635BFF]/30 bg-[#635BFF]/10 px-3 py-1 text-xs text-[#635BFF] mb-6">
          <Sparkles className="h-3 w-3" />
          Coming Soon
        </div>
        <h1 className="text-3xl font-bold text-white md:text-4xl">Research</h1>
        <p className="mt-4 max-w-lg mx-auto text-slate-400">Company snapshots, buying triggers, and enrichment for personalized outreach</p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5046e5] transition-colors"
        >
          Back to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
