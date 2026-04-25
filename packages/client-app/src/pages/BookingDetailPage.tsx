import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookingStatusBadge, MessageThread, formatCurrency, formatDate, formatTime, useAuth,
} from '@mygigs/shared';
import type { BookingStatus, QuoteRow } from '@mygigs/shared';
import { fetchBookingDetail, fetchBookingQuotes, cancelBooking, acceptQuote, declineQuote } from '../services/bookings';
import { useToast } from '../contexts/ToastContext';

const STAGES: BookingStatus[] = ['pending', 'negotiating', 'confirmed', 'completed'];
const STAGE_LABEL: Record<string, string> = {
  pending: 'Requested',
  negotiating: 'Quote received',
  confirmed: 'Confirmed',
  completed: 'Completed',
};

export const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any | null>(null);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    if (!id) return;
    const b = await fetchBookingDetail(id);
    setBooking(b);
    const q = await fetchBookingQuotes(id);
    setQuotes(q);
  };

  useEffect(() => { void reload(); }, [id]);

  if (!booking || !id) return <div className="p-12 text-center text-gray-500">Loading…</div>;

  const stageIdx = STAGES.indexOf(booking.status);
  const pendingQuote = quotes.find((q) => q.status === 'pending');

  const onCancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    setBusy(true);
    try { await cancelBooking(id); await reload(); toast('success', 'Booking cancelled'); }
    catch (e) { toast('error', (e as Error).message); }
    finally { setBusy(false); }
  };

  const onAccept = async (q: QuoteRow) => {
    setBusy(true);
    try { await acceptQuote(q.id, id); await reload(); toast('success', 'Quote accepted'); }
    catch (e) { toast('error', (e as Error).message); }
    finally { setBusy(false); }
  };

  const onDecline = async (q: QuoteRow) => {
    setBusy(true);
    try { await declineQuote(q.id); await reload(); toast('info', 'Quote declined'); }
    catch (e) { toast('error', (e as Error).message); }
    finally { setBusy(false); }
  };

  const canCancel = ['pending', 'accepted', 'negotiating'].includes(booking.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Booking</h1>
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

        <Link to={`/musician/${booking.musician_id}`} className="rounded-2xl border bg-white p-5 hover:shadow">
          <h2 className="mb-3 font-semibold">Musician</h2>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
              {booking.musician?.user?.avatar_url && (
                <img src={booking.musician.user.avatar_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <p className="font-semibold">{booking.musician?.user?.full_name}</p>
              <p className="text-sm text-gray-500">{booking.musician?.user?.city}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-brand-600">View profile →</p>
        </Link>
      </div>

      {pendingQuote && (
        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-5">
          <h2 className="mb-2 font-semibold">Quote received</h2>
          <p className="text-2xl font-bold text-brand-700">{formatCurrency(pendingQuote.amount)}</p>
          {pendingQuote.message && <p className="mt-1 text-sm text-gray-700">{pendingQuote.message}</p>}
          {pendingQuote.expires_at && (
            <p className="mt-1 text-xs text-gray-500">Expires {new Date(pendingQuote.expires_at).toLocaleString()}</p>
          )}
          <div className="mt-3 flex gap-2">
            <button disabled={busy} onClick={() => onAccept(pendingQuote)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50">
              Accept quote
            </button>
            <button disabled={busy} onClick={() => onDecline(pendingQuote)}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
              Decline
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="mb-2 font-semibold">Contract</h2>
        <p className="text-gray-500">Contract will appear here.</p>
      </div>

      <div className="rounded-2xl border-2 border-dashed bg-amber-50 p-5">
        <h2 className="mb-1 font-semibold">Payment</h2>
        <p className="text-sm text-gray-700">Payment integration coming soon.</p>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Messages</h2>
        {user && <MessageThread bookingId={id} currentUserId={user.id} role="client" />}
      </div>

      {booking.status === 'completed' && (
        <Link to={`/reviews/new/${id}`} className="block rounded-lg bg-brand-600 py-2.5 text-center font-medium text-white">
          Leave a review
        </Link>
      )}
      {canCancel && (
        <button disabled={busy} onClick={onCancel}
          className="w-full rounded-lg border border-red-300 py-2.5 text-red-600 hover:bg-red-50">
          Cancel booking
        </button>
      )}
    </div>
  );
};

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between py-1 text-sm">
    <span className="text-gray-500">{k}</span><span className="font-medium">{v}</span>
  </div>
);
