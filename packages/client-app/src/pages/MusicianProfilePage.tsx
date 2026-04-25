import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StarRating, AvailabilityGrid, formatCurrency } from '@mygigs/shared';
import type { ReviewRow } from '@mygigs/shared';
import { fetchMusicianById, fetchMusicianReviews, MusicianListItem } from '../services/musicians';

type Tab = 'about' | 'media' | 'reviews' | 'availability';

export const MusicianProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [musician, setMusician] = useState<MusicianListItem | null | undefined>(undefined);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [tab, setTab] = useState<Tab>('about');

  useEffect(() => {
    if (!id) return;
    fetchMusicianById(id).then(setMusician).catch(() => setMusician(null));
    fetchMusicianReviews(id).then(setReviews).catch(() => setReviews([]));
  }, [id]);

  if (musician === undefined) return <div className="p-12 text-center text-gray-500">Loading profile…</div>;
  if (musician === null) return <div className="p-12 text-center text-gray-500">Musician not found.</div>;

  const verified = musician.kyc_status === 'approved';
  const bookable = verified && musician.is_active;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="rounded-3xl bg-gradient-to-br from-brand-600 to-purple-600 p-8 text-white">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-full bg-white/20 ring-4 ring-white/30">
            {musician.user?.avatar_url ? (
              <img src={musician.user.avatar_url} alt={musician.user.full_name ?? ''} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold">{musician.user?.full_name}</h1>
              {verified && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">✓ Verified</span>}
            </div>
            <p className="mt-1 text-white/80">{musician.user?.city}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(musician.instruments ?? []).map((i) => (
                <span key={i} className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{i}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <StarRating value={musician.avg_rating ?? 0} />
              <span className="text-sm text-white/80">
                {musician.avg_rating?.toFixed(1) ?? 'New'} · {musician.total_reviews} reviews
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <nav className="mb-4 flex gap-1 border-b">
            {(['about', 'media', 'reviews', 'availability'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  tab === t ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>

          {tab === 'about' && (
            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-gray-700">{musician.bio ?? 'No bio yet.'}</p>
              <Section title="Genres" items={musician.genres} />
              <Section title="Languages" items={musician.languages} />
              <p className="text-sm text-gray-500">Min booking: {musician.min_booking_hours ?? 1} hours</p>
            </div>
          )}

          {tab === 'media' && (
            <div className="space-y-4">
              {musician.profile_video_url ? (
                <iframe
                  src={musician.profile_video_url}
                  className="aspect-video w-full rounded-xl border"
                  allowFullScreen
                />
              ) : (
                <p className="text-gray-500">No profile video.</p>
              )}
              <h3 className="font-semibold">Sample tracks</h3>
              {(musician.sample_tracks ?? []).length === 0 && <p className="text-gray-500">No samples yet.</p>}
              {(musician.sample_tracks ?? []).map((t, i) => (
                <div key={i} className="rounded-xl border bg-white p-3">
                  <p className="mb-1 text-sm font-medium">{t.title}</p>
                  <audio src={t.url} controls className="w-full" />
                </div>
              ))}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <StarRating value={r.rating} size="sm" />
                    <span className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{r.review_text}</p>
                  {r.musician_response && (
                    <div className="mt-3 border-l-4 border-brand-200 bg-brand-50 p-3 text-sm">
                      <p className="mb-1 font-semibold text-brand-700">Musician's response</p>
                      <p>{r.musician_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'availability' && (
            <AvailabilityGrid value={(musician.availability as any) ?? {}} onChange={() => {}} readOnly />
          )}
        </div>

        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <p className="text-sm text-gray-500">Starting from</p>
          <p className="text-3xl font-bold text-brand-600">
            {formatCurrency(musician.hourly_rate)}<span className="text-sm font-normal text-gray-500">/hour</span>
          </p>
          {bookable ? (
            <Link
              to={`/book/${musician.id}`}
              className="mt-4 block rounded-lg bg-brand-600 py-2.5 text-center font-medium text-white hover:bg-brand-700"
            >
              Book now
            </Link>
          ) : (
            <button disabled className="mt-4 w-full rounded-lg bg-gray-200 py-2.5 font-medium text-gray-500">
              Profile under review
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

const Section = ({ title, items }: { title: string; items: string[] | null }) =>
  items?.length ? (
    <div>
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div className="mt-1 flex flex-wrap gap-1">
        {items.map((x) => (
          <span key={x} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{x}</span>
        ))}
      </div>
    </div>
  ) : null;
