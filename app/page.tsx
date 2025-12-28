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
            Balance custom magic items by discovering which official item yours is most similar to.
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            Every custom item you create is compared to a balanced <strong>anchor item</strong> from
            official sources. See exactly how your item stacks up—stronger, weaker, or equal—and
            understand <em>why</em> it has a certain rarity.
          </p>
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
