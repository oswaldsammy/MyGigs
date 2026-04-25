import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookingStatusBadge, formatCurrency, formatDate } from '@mygigs/shared';
import type { BookingStatus } from '@mygigs/shared';
import { listMyBookings } from '../services/bookings';

type Tab = 'all' | BookingStatus;
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export const MyBookingsPage = () => {
  const [tab, setTab] = useState<Tab>('all');
  const [rows, setRows] = useState<any[] | null>(null);

  useEffect(() => {
    setRows(null);
    listMyBookings(tab).then((d) => setRows(d as any[]));
  }, [tab]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-bold">My bookings</h1>
      <div className="mb-4 flex gap-1 border-b overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm ${
              tab === t.key ? 'border-b-2 border-brand-400 text-brand-400' : 'text-gray-500 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rows === null ? (
        <p className="text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center">
          <p className="text-gray-500">No {tab === 'all' ? '' : tab} bookings yet.</p>
          <Link to="/search" className="mt-3 inline-block text-brand-400 hover:underline">Browse musicians →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="flex items-center gap-4 rounded-xl border bg-elev p-4 hover:shadow"
            >
              <div className="h-12 w-12 overflow-hidden rounded-full bg-line">
                {b.musician?.user?.avatar_url && <img src={b.musician.user.avatar_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.musician?.user?.full_name ?? 'Musician'}</p>
                <p className="text-sm text-gray-500">{formatDate(b.event_date)} · {b.venue_name ?? '—'}</p>
              </div>
              <div className="text-right">
                <BookingStatusBadge status={b.status} />
                <p className="mt-1 text-sm font-medium">{formatCurrency(b.total_amount)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
