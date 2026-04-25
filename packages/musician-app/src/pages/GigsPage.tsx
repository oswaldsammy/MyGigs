import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookingStatusBadge, formatCurrency, formatDate } from '@mygigs/shared';
import type { BookingStatus } from '@mygigs/shared';
import { listGigs, updateGigStatus } from '../services/gigs';
import { useToast } from '../contexts/ToastContext';

type Tab = 'new' | 'upcoming' | 'completed' | 'declined';
const STATUS_FOR: Record<Tab, (s: BookingStatus) => boolean> = {
  new: (s) => s === 'pending',
  upcoming: (s) => s === 'confirmed' || s === 'accepted' || s === 'negotiating',
  completed: (s) => s === 'completed',
  declined: (s) => s === 'declined' || s === 'cancelled',
};

export const GigsPage = () => {
  const [tab, setTab] = useState<Tab>('new');
  const [rows, setRows] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setRows(null);
    const all = await listGigs('all');
    setRows((all as any[]).filter((b) => STATUS_FOR[tab](b.status)));
  };

  useEffect(() => { void load(); }, [tab]);

  const quickAccept = async (id: string) => {
    setBusy(id);
    try { await updateGigStatus(id, 'accepted'); toast('success', 'Accepted'); await load(); }
    catch (e) { toast('error', (e as Error).message); }
    finally { setBusy(null); }
  };

  const quickDecline = async (id: string) => {
    if (!confirm('Decline this gig?')) return;
    setBusy(id);
    try { await updateGigStatus(id, 'declined', 'Not available'); toast('info', 'Declined'); await load(); }
    catch (e) { toast('error', (e as Error).message); }
    finally { setBusy(null); }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-bold">Gigs</h1>
      <div className="mb-4 flex gap-1 border-b overflow-x-auto">
        {(Object.keys(STATUS_FOR) as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${tab === t ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500 hover:text-gray-900'}`}>
            {t}
          </button>
        ))}
      </div>

      {rows === null ? (
        <p className="text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center text-gray-500">
          No gigs in this tab.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <div key={b.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                  {b.client?.avatar_url && <img src={b.client.avatar_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{b.client?.full_name ?? 'Client'}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(b.event_date)} · {b.venue_name ?? '—'} · {b.event_type ?? '—'}
                  </p>
                  <p className="mt-1 text-sm font-medium">{formatCurrency(b.total_amount)}</p>
                </div>
                <BookingStatusBadge status={b.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/gigs/${b.id}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                  View details
                </Link>
                {tab === 'new' && (
                  <>
                    <button disabled={busy === b.id} onClick={() => quickAccept(b.id)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white disabled:opacity-50">
                      Accept
                    </button>
                    <button disabled={busy === b.id} onClick={() => quickDecline(b.id)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50">
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
