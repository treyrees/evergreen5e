import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100">
            HomebrewQA
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            D&D 5e Balance Calculator
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-4">
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Balance homebrew content for D&D 5e and 5e-compatible systems.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            All calculations use <strong>deterministic formulas</strong> running entirely in-app.
            No AI queries, no LLM API calls—just transparent, reproducible math comparing your
            creations against official <strong>anchor items</strong> from the SRD.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/calculator"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Balance Item
          </Link>
          <Link
            href="/items"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Browse Items Database
          </Link>
        </div>

        {/* Coming Soon */}
        <div className="pt-4">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Coming soon</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <span className="inline-block bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-medium px-6 py-3 rounded-lg cursor-not-allowed opacity-60">
              Balance Monster
            </span>
            <span className="inline-block bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-medium px-6 py-3 rounded-lg cursor-not-allowed opacity-60">
              Balance Spell
            </span>
          </div>
        </div>

        <div className="pt-4 text-sm text-slate-500 dark:text-slate-500">
          <p>
            Based on D&D 5e SRD and mathematical balance principles
          </p>
        </div>
      </div>
    </div>
  );
}
