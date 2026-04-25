import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, formatDate } from '@mygigs/shared';
import { fetchGigDetail, sendQuote } from '../services/gigs';
import { getMyMusician } from '../services/profile';
import { useToast } from '../contexts/ToastContext';

export const QuotePage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any | null>(null);
  const [rate, setRate] = useState(0);
  const [duration, setDuration] = useState(0);
  const [message, setMessage] = useState('');
  const [expires, setExpires] = useState(48);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    void (async () => {
      const b = await fetchGigDetail(bookingId);
      const m = await getMyMusician();
      setBooking(b);
      setRate(m?.hourly_rate ?? 0);
      setDuration(b.duration_hours);
    })();
  }, [bookingId]);

  if (!booking || !bookingId) return <div className="p-12 text-center text-gray-500">Loading…</div>;

  const subtotal = rate * duration;
  const fee = +(subtotal * 0.1).toFixed(2);
  const earnings = +(subtotal - fee).toFixed(2);

  const submit = async () => {
    setSubmitting(true);
    try {
      await sendQuote(bookingId, subtotal, message, expires);
      toast('success', 'Quote sent');
      navigate(`/gigs/${bookingId}`);
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <div className="mb-4 rounded-2xl border bg-elev p-4 text-sm">
        <p className="font-semibold">{formatDate(booking.event_date)}</p>
        <p className="text-gray-500">{booking.duration_hours} hours · {booking.venue_name ?? '—'}</p>
      </div>

      <div className="rounded-2xl bg-elev p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-bold">Send a quote</h1>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Hourly rate">
            <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))}
              className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Duration (hours)">
            <input type="number" step={0.5} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg border px-3 py-2" />
          </Field>
        </div>

        <div className="mt-4 rounded-xl bg-surface p-4 text-sm">
          <Row k="Quote total" v={formatCurrency(subtotal)} />
          <Row k="Platform fee (10%)" v={`− ${formatCurrency(fee)}`} />
          <Row k="Your earnings" v={formatCurrency(earnings)} bold />
        </div>

        <Field label="Message to client (optional)" className="mt-4">
          <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border px-3 py-2" />
        </Field>

        <Field label="Quote expires" className="mt-4">
          <div className="flex gap-2">
            {[24, 48, 72].map((h) => (
              <button key={h} type="button" onClick={() => setExpires(h)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${expires === h ? 'border-brand-400 bg-brand-400/10 text-brand-400' : ''}`}>
                {h} hrs
              </button>
            ))}
          </div>
        </Field>

        <button disabled={submitting} onClick={submit}
          className="mt-6 w-full rounded-lg bg-brand-400 text-black py-2.5 font-medium text-white disabled:opacity-50">
          {submitting ? 'Sending…' : 'Send quote'}
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="mb-1 block text-sm font-medium">{label}</label>
    {children}
  </div>
);

const Row = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div className={`flex justify-between py-0.5 ${bold ? 'mt-1 border-t pt-2 font-semibold' : ''}`}>
    <span className="text-gray-400">{k}</span><span>{v}</span>
  </div>
);
