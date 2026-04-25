import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicianCard } from '@mygigs/shared';
import { fetchTopMusicians, MusicianListItem } from '../services/musicians';

export const HomePage = () => {
  const [genre, setGenre] = useState('');
  const [city, setCity] = useState('');
  const [instrument, setInstrument] = useState('');
  const [musicians, setMusicians] = useState<MusicianListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopMusicians(8)
      .then(setMusicians)
      .catch((e) => setError((e as Error).message));
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (genre) params.set('genre', genre);
    if (city) params.set('city', city);
    if (instrument) params.set('instrument', instrument);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-purple-600 px-8 py-12 text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Find the perfect musician for your event</h1>
        <p className="mt-2 text-white/80">Live music, every occasion. Browse, book, done.</p>
        <form onSubmit={search} className="mt-6 grid gap-3 rounded-2xl bg-white p-4 text-gray-900 sm:grid-cols-4">
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="rounded-lg border px-3 py-2">
            <option value="">Any genre</option>
            <option>Jazz</option><option>Rock</option><option>Pop</option><option>Classical</option>
            <option>Hip-Hop</option><option>Electronic</option><option>Country</option><option>Folk</option>
          </select>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="rounded-lg border px-3 py-2"
          />
          <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className="rounded-lg border px-3 py-2">
            <option value="">Any instrument</option>
            <option>Guitar</option><option>Piano</option><option>Drums</option><option>Vocals</option>
            <option>Saxophone</option><option>Violin</option><option>Bass</option>
          </select>
          <button className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white">Find musicians</button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">Top rated musicians</h2>
        {error && <p className="text-red-600">{error}</p>}
        {musicians === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : musicians.length === 0 ? (
          <p className="text-gray-500">No musicians found in your area yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {musicians.map((m) => (
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
