import { useEffect, useMemo, useState } from 'react';
import { StarRating } from '@mygigs/shared';
import type { ReviewRow } from '@mygigs/shared';
import { listMyReviews, respondToReview } from '../services/reviews';
import { useToast } from '../contexts/ToastContext';

type Filter = 'all' | '5' | '4' | 'low';

export const ReviewsPage = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const reload = async () => setReviews(await listMyReviews());
  useEffect(() => { void reload(); }, []);

  const filtered = useMemo(() => {
    if (!reviews) return null;
    if (filter === 'all') return reviews;
    if (filter === '5') return reviews.filter((r) => r.rating === 5);
    if (filter === '4') return reviews.filter((r) => r.rating === 4);
    return reviews.filter((r) => r.rating <= 3);
  }, [reviews, filter]);

  const summary = useMemo(() => {
    if (!reviews?.length) return null;
    const total = reviews.length;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => (breakdown[r.rating] = (breakdown[r.rating] ?? 0) + 1));
    return { total, avg, breakdown };
  }, [reviews]);

  const submitReply = async (id: string) => {
    try { await respondToReview(id, draft); toast('success', 'Reply posted'); setEditing(null); setDraft(''); await reload(); }
    catch (e) { toast('error', (e as Error).message); }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-bold">Reviews</h1>

      {summary ? (
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-4xl font-bold">{summary.avg.toFixed(1)}</p>
              <StarRating value={Math.round(summary.avg)} />
              <p className="mt-1 text-sm text-gray-500">{summary.total} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.breakdown[star];
                const pct = (count / summary.total) * 100;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-4">{star}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border-2 border-dashed p-8 text-center text-sm text-gray-500">
          No reviews yet — complete your first gig to start receiving reviews.
        </div>
      )}

      {summary && (
        <div className="mb-4 flex gap-1 border-b">
          {(['all', '5', '4', 'low'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm ${filter === f ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-900'}`}>
              {f === 'all' ? 'All' : f === '5' ? '5 star' : f === '4' ? '4 star' : '3 star and below'}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {(filtered ?? []).map((r) => (
          <div key={r.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <StarRating value={r.rating} size="sm" />
              <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 text-gray-800">{r.review_text}</p>

            {r.musician_response && editing !== r.id && (
              <div className="mt-3 border-l-4 border-brand-200 bg-brand-50 p-3 text-sm">
                <p className="mb-1 font-semibold text-brand-700">Your response</p>
                <p>{r.musician_response}</p>
                <button onClick={() => { setEditing(r.id); setDraft(r.musician_response ?? ''); }}
                  className="mt-1 text-xs text-brand-600 hover:underline">Edit reply</button>
              </div>
            )}

            {!r.musician_response && editing !== r.id && (
              <button onClick={() => { setEditing(r.id); setDraft(''); }}
                className="mt-2 text-sm text-brand-600 hover:underline">
                Reply to this review
              </button>
            )}

            {editing === r.id && (
              <div className="mt-3">
                <textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm" />
                <div className="mt-2 flex gap-2">
                  <button onClick={() => submitReply(r.id)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white">Post reply</button>
                  <button onClick={() => setEditing(null)}
                    className="rounded-lg border px-3 py-1.5 text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
