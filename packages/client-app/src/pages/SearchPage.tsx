import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MusicianCard } from '@mygigs/shared';
import { searchMusicians, MusicianListItem } from '../services/musicians';

export const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const [results, setResults] = useState<MusicianListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const genre = params.get('genre') ?? '';
  const instrument = params.get('instrument') ?? '';
  const city = params.get('city') ?? '';
  const minRating = Number(params.get('minRating') ?? '0');
  const maxRate = Number(params.get('maxRate') ?? '0');
  const sort = (params.get('sort') as any) ?? 'relevance';

  useEffect(() => {
    setResults(null);
    searchMusicians({
      genre: genre || undefined,
      instrument: instrument || undefined,
      city: city || undefined,
      minRating: minRating || undefined,
      maxRate: maxRate || undefined,
      sort,
    })
      .then(setResults)
      .catch((e) => setError((e as Error).message));
  }, [genre, instrument, city, minRating, maxRate, sort]);

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4 rounded-xl border bg-elev p-4">
        <h2 className="font-semibold">Filters</h2>
        <div>
          <label className="mb-1 block text-xs font-medium">Genre</label>
          <input
            value={genre}
            onChange={(e) => update('genre', e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. Jazz"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Instrument</label>
          <input
            value={instrument}
            onChange={(e) => update('instrument', e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">City</label>
          <input
            value={city}
            onChange={(e) => update('city', e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Min rating: {minRating || 'any'}</label>
          <input type="range" min={0} max={5} step={0.5} value={minRating}
            onChange={(e) => update('minRating', e.target.value)} className="w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Max hourly rate: {maxRate || 'any'}</label>
          <input type="range" min={0} max={500} step={10} value={maxRate}
            onChange={(e) => update('maxRate', e.target.value)} className="w-full" />
        </div>
        <button onClick={() => setParams(new URLSearchParams())} className="text-xs text-brand-400 hover:underline">
          Clear all filters
        </button>
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {results ? `Showing ${results.length} musicians` : 'Loading…'}
          </p>
          <select
            value={sort}
            onChange={(e) => update('sort', e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Highest rated</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
        {error && <p className="text-red-400">{error}</p>}
        {results === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-elev" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-12 text-center text-gray-500">
            No musicians match your filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((m) => (
              <MusicianCard
                key={m.id}
                id={m.id}
                name={m.user?.full_name ?? 'Musician'}
                instruments={m.instruments ?? []}
                city={m.user?.city ?? null}
                rating={m.avg_rating}
                price={m.hourly_rate}
                avatarUrl={m.user?.avatar_url ?? null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
