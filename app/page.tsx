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
            Get instant validation. Compare against official D&D 5e items with transparent math. In-browser logic gives you immediate feedback—stop waiting for your friend to use ChatGPT at your table.
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
      </div>
    </div>
  );
}
