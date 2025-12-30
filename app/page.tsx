import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Is Your Homebrew Balanced?
          </h1>
          <p className="text-xl text-slate-400">
            Get instant validation. Compare against official D&D 5e items with transparent math.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <Link
            href="/calculator"
            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg px-10 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl min-w-[200px]"
          >
            Balance My Item
            <span className="ml-2">→</span>
          </Link>
          <Link
            href="/items"
            className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            or browse item database
          </Link>
        </div>

        <div className="mt-8 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <span className="text-lg">🔒</span>
            <span className="font-semibold">No AI Queries</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 text-center">
            Your inputs stay in your browser. Pure client-side math.
          </p>
        </div>
      </div>

      <footer className="pb-8 text-sm text-slate-600">
        Based on D&D 5e SRD &bull; Transparent formulas
      </footer>
    </div>
  );
}
