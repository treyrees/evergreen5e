import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100">
            Evergreen 5e
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Encyclopedic Magic Item Balancing
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-4">
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Balance custom magic items with <span className="text-emerald-600 dark:text-emerald-400">educational anchors</span> from the D&D 5e SRD.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            Every custom item you create is compared to a balanced <strong>anchor item</strong> from
            official sources. See exactly how your item stacks up—stronger, weaker, or equal—and
            understand <em>why</em> it has a certain rarity.
          </p>
          <div className="border-l-4 border-emerald-600 pl-4 py-2 bg-emerald-50 dark:bg-emerald-950/30">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300">⚓ Anchor Items:</strong> Direct
              references to known balanced items that serve as your baseline for comparison.
              Mathematical scoring plus educational context means you learn balance principles,
              not just numbers.
            </p>
          </div>
        </div>

        <Link
          href="/calculator"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Create Item
        </Link>

        <div className="pt-8 text-sm text-slate-500 dark:text-slate-500">
          <p>
            Based on D&D 5e SRD magic items and mathematical balance principles
          </p>
        </div>
      </div>
    </div>
  );
}
