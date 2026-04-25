import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '@mygigs/shared';
import { fetchMusicianById, MusicianListItem } from '../services/musicians';
import { createBooking } from '../services/bookings';
import { useToast } from '../contexts/ToastContext';

interface Form {
  eventDate: string;
  startTime: string;
  durationHours: number;
  venueName: string;
  venueAddress: string;
  eventType: string;
  specialRequests?: string;
}

export const BookingFormPage = () => {
  const { musicianId } = useParams<{ musicianId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [musician, setMusician] = useState<MusicianListItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    defaultValues: { durationHours: 2, eventType: 'Wedding' },
  });

  useEffect(() => {
    if (musicianId) fetchMusicianById(musicianId).then(setMusician);
  }, [musicianId]);

  const duration = Number(watch('durationHours') || 0);
  const rate = musician?.hourly_rate ?? 0;
  const subtotal = duration * rate;
  const fee = useMemo(() => +(subtotal * 0.1).toFixed(2), [subtotal]);
  const total = +(subtotal + fee).toFixed(2);

  const onSubmit = async (v: Form) => {
    if (!musicianId || !musician) return;
    setSubmitting(true);
    try {
      const b = await createBooking({
        musicianId,
        eventDate: v.eventDate,
        startTime: v.startTime,
        durationHours: v.durationHours,
        venueName: v.venueName,
        venueAddress: v.venueAddress,
        eventType: v.eventType,
        specialRequests: v.specialRequests,
        hourlyRate: rate,
      });
      toast('success', 'Booking request sent!');
      navigate(`/bookings/${b.id}`);
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!musician) return <div className="p-12 text-center text-gray-500">Loading…</div>;
  const minHrs = musician.min_booking_hours ?? 1;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
            {musician.user?.avatar_url ? <img src={musician.user.avatar_url} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div>
            <p className="font-semibold">{musician.user?.full_name}</p>
            <p className="text-sm text-gray-500">{formatCurrency(rate)}/hour</p>
          </div>
        </div>

        <h1 className="mb-4 text-xl font-bold">Event details</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event date" error={errors.eventDate?.message}>
            <input type="date" {...register('eventDate', { required: 'Pick a date' })}
              className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Start time" error={errors.startTime?.message}>
            <input type="time" {...register('startTime', { required: 'Pick a start time' })}
              className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label={`Duration (min ${minHrs} hours)`} error={errors.durationHours?.message}>
            <input type="number" step={0.5} min={minHrs}
              {...register('durationHours', { required: 'Required', min: { value: minHrs, message: `Min ${minHrs} hours` }, valueAsNumber: true })}
              className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Event type" error={errors.eventType?.message}>
            <select {...register('eventType', { required: true })} className="w-full rounded-lg border px-3 py-2">
              {['Wedding', 'Corporate', 'Birthday', 'Concert', 'Festival', 'Private party', 'Other'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Venue name" error={errors.venueName?.message} className="sm:col-span-2">
            <input {...register('venueName', { required: 'Required' })} className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Venue address" error={errors.venueAddress?.message} className="sm:col-span-2">
            <input {...register('venueAddress', { required: 'Required' })} className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Special requests" className="sm:col-span-2">
            <textarea rows={4} {...register('specialRequests')} className="w-full rounded-lg border px-3 py-2" />
          </Field>
        </div>

        <button disabled={submitting}
          className="mt-6 w-full rounded-lg bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-50">
          {submitting ? 'Sending…' : 'Send booking request'}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          You won't be charged yet — the musician will review and send a quote.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-6">
        <h2 className="mb-3 font-semibold">Price estimate</h2>
        <div className="space-y-2 text-sm">
          <Row label={`${formatCurrency(rate)} × ${duration} hrs`} value={formatCurrency(subtotal)} />
          <Row label="Platform fee (10%)" value={formatCurrency(fee)} />
          <div className="my-2 border-t" />
          <Row label="Total" value={formatCurrency(total)} bold />
        </div>
      </aside>
    </div>
  );
};

const Field = ({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="mb-1 block text-sm font-medium">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex justify-between ${bold ? 'font-semibold' : ''}`}>
    <span>{label}</span><span>{value}</span>
  </div>
);
