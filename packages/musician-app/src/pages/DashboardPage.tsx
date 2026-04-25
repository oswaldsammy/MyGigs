import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookingStatusBadge, formatCurrency, formatDate } from '@mygigs/shared';
import type { MusicianProfileRow, UserRow } from '@mygigs/shared';
import { getMyMusician, getMyUser } from '../services/profile';
import { listGigs } from '../services/gigs';

export const DashboardPage = () => {
  const [user, setUser] = useState<UserRow | null>(null);
  const [musician, setMusician] = useState<MusicianProfileRow | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
    void (async () => {
      setUser(await getMyUser());
      setMusician(await getMyMusician());
      const all = await listGigs('all');
      setPending(all.filter((b: any) => b.status === 'pending').slice(0, 3));
      setUpcoming(all.filter((b: any) => b.status === 'confirmed').slice(0, 5));
    })();
  }, []);

  const status = musician?.kyc_status;
  const banner = status === 'rejected'
    ? { color: 'bg-red-500/100/10 border-red-500/30 text-red-300', text: 'Your documents were rejected.', link: '/kyc', linkText: 'See details →' }
    : status === 'submitted' || status === 'pending'
    ? { color: 'bg-amber-500/100/10 border-amber-500/30 text-amber-300', text: 'Your profile is under review. You will be notified once approved.', link: null, linkText: '' }
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold">Good {greeting()}, {user?.full_name?.split(' ')[0] ?? 'there'}</h1>

      {banner && (
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${banner.color}`}>
          {banner.text}{' '}
          {banner.link && <Link to={banner.link} className="underline">{banner.linkText}</Link>}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New requests" value={pending.length.toString()} />
        <Stat label="Upcoming gigs" value={upcoming.length.toString()} />
        <Stat label="Total earnings" value={formatCurrency(0)} />
        <Stat label="Avg rating" value={musician?.avg_rating?.toFixed(1) ?? '—'} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">New gig requests</h2>
          <Link to="/gigs" className="text-sm text-brand-400 hover:underline">View all →</Link>
        </div>
        {pending.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed p-6 text-center text-sm text-gray-500">No new requests right now.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((b) => (
              <GigCard key={b.id} b={b} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold">Upcoming gigs</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed p-6 text-center text-sm text-gray-500">
            No upcoming gigs — your profile is live and clients can find you.
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b) => <GigCard key={b.id} b={b} />)}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link to="/profile" className="rounded-xl bg-elev p-4 text-center shadow-sm hover:shadow">Edit profile</Link>
        <Link to="/profile" className="rounded-xl bg-elev p-4 text-center shadow-sm hover:shadow">Update availability</Link>
        <Link to="/earnings" className="rounded-xl bg-elev p-4 text-center shadow-sm hover:shadow">View earnings</Link>
      </section>
    </div>
  );
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-elev p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const GigCard = ({ b }: { b: any }) => (
  <Link to={`/gigs/${b.id}`} className="flex items-center gap-3 rounded-xl border bg-elev p-4 hover:shadow">
    <div className="h-10 w-10 overflow-hidden rounded-full bg-line">
      {b.client?.avatar_url && <img src={b.client.avatar_url} alt="" className="h-full w-full object-cover" />}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold">{b.client?.full_name ?? 'Client'}</p>
      <p className="truncate text-xs text-gray-500">{formatDate(b.event_date)} · {b.venue_name ?? '—'}</p>
    </div>
    <BookingStatusBadge status={b.status} />
  </Link>
);
