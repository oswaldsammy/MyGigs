import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookingStatusBadge, MessageThread, formatCurrency, formatDate, formatTime, useAuth,
} from '@mygigs/shared';
import type { BookingStatus, QuoteRow } from '@mygigs/shared';
import { fetchGigDetail, fetchQuotesForBooking, updateGigStatus } from '../services/gigs';
import { useToast } from '../contexts/ToastContext';

const STAGES: BookingStatus[] = ['pending', 'negotiating', 'confirmed', 'completed'];
const STAGE_LABEL: Record<string, string> = {
  pending: 'Requested', negotiating: 'Quote sent', confirmed: 'Confirmed', completed: 'Completed',
};

const DECLINE_REASONS = ['Not available', 'Outside my style', 'Other'];

export const GigDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any | null>(null);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [reason, setReason] = useState(DECLINE_REASONS[0]);

  const reload = async () => {
    if (!id) return;
    setBooking(await fetchGigDetail(id));
    setQuotes(await fetchQuotesForBooking(id));
  };

  useEffect(() => { void reload(); }, [id]);

  if (!booking || !id) return <div className="p-12 text-center text-gray-500">Loading…</div>;

  const stageIdx = STAGES.indexOf(booking.status);
  const pendingQuote = quotes.find((q) => q.status === 'pending');
  const acceptedQuote = quotes.find((q) => q.status === 'accepted');

  const accept = async () => {
    setBusy(true);
    try { await updateGigStatus(id, 'accepted'); await reload(); toast('success', 'Accepted'); }
    catch (e) { toast('error', (e as Error).message); }
    finally { setBusy(false); }
  };

  const decline = async () => {
    setBusy(true);
    try { await updateGigStatus(id, 'declined', reason); await reload(); toast('info', 'Declined'); setShowDecline(false); }
    catch (e) { toast('error', (e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Gig</h1>
        <BookingStatusBadge status={booking.status} />
      </div>

      <ol className="flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-4 text-sm">
        {STAGES.map((s, i) => {
          const done = i <= stageIdx && stageIdx >= 0;
          return (
            <li key={s} className="flex items-center gap-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                done ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{i + 1}</span>
              <span className={done ? 'font-medium' : 'text-gray-500'}>{STAGE_LABEL[s]}</span>
              {i < STAGES.length - 1 && <span className="text-gray-300">›</span>}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Event</h2>
          <Row k="Date" v={formatDate(booking.event_date)} />
          <Row k="Time" v={formatTime(booking.start_time)} />
          <Row k="Duration" v={`${booking.duration_hours} hours`} />
          <Row k="Venue" v={booking.venue_name ?? '—'} />
          <Row k="Address" v={booking.venue_address ?? '—'} />
          <Row k="Type" v={booking.event_type ?? '—'} />
          {booking.special_requests && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">{booking.special_requests}</div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Client</h2>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
              {booking.client?.avatar_url && <img src={booking.client.avatar_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div>
              <p className="font-semibold">{booking.client?.full_name}</p>
              <p className="text-sm text-gray-500">{booking.client?.city ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="mb-3 font-semibold">Actions</h2>
        {booking.status === 'pending' && !showDecline && (
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={accept}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50">
              Accept
            </button>
            <Link to={`/quotes/${id}`}
              className="rounded-lg border border-brand-600 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50">
              Accept & send quote
            </Link>
            <button disabled={busy} onClick={() => setShowDecline(true)}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 disabled:opacity-50">
              Decline
            </button>
          </div>
        )}
        {showDecline && (
          <div className="space-y-3">
            <label className="block text-sm">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm">
              {DECLINE_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <button disabled={busy} onClick={decline}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                Confirm decline
              </button>
              <button onClick={() => setShowDecline(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        )}
        {booking.status === 'accepted' && !pendingQuote && (
          <Link to={`/quotes/${id}`} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
            Send quote
          </Link>
        )}
        {pendingQuote && (
          <div className="rounded-xl bg-amber-50 p-4 text-sm">
            <p>Quote sent: <strong>{formatCurrency(pendingQuote.amount)}</strong> · awaiting client response.</p>
            <Link to={`/quotes/${id}`} className="mt-2 inline-block text-brand-600 hover:underline">Edit quote</Link>
          </div>
        )}
        {acceptedQuote && (
          <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
            ✓ Quote accepted at {formatCurrency(acceptedQuote.amount)}. Booking confirmed.
          </div>
        )}
        {booking.decline_reason && (
          <p className="mt-2 text-sm text-gray-500">Decline reason: {booking.decline_reason}</p>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="mb-2 font-semibold">Contract</h2>
        <p className="text-gray-500">Contract details will appear here.</p>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Messages</h2>
        {user && <MessageThread bookingId={id} currentUserId={user.id} role="musician" />}
      </div>
    </div>
  );
};

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between py-1 text-sm">
    <span className="text-gray-500">{k}</span><span className="font-medium">{v}</span>
  </div>
);
