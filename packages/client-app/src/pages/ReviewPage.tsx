import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { StarRating } from '@mygigs/shared';
import { fetchBookingDetail } from '../services/bookings';
import { findReviewForBooking, submitReview } from '../services/reviews';
import { useToast } from '../contexts/ToastContext';

interface Form { reviewText: string }

export const ReviewPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>();

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      const b = await fetchBookingDetail(bookingId);
      if (b.status !== 'completed') {
        navigate(`/bookings/${bookingId}`);
        return;
      }
      const existing = await findReviewForBooking(bookingId);
      if (existing) {
        navigate(`/bookings/${bookingId}`);
        return;
      }
      setBooking(b);
    })();
  }, [bookingId, navigate]);

  const onSubmit = async (v: Form) => {
    if (!bookingId || !booking) return;
    setSubmitting(true);
    try {
      await submitReview(bookingId, booking.musician_id, rating, v.reviewText);
      toast('success', 'Review submitted — thank you!');
      navigate(`/bookings/${bookingId}`);
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) return <div className="p-12 text-center text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
            {booking.musician?.user?.avatar_url && (
              <img src={booking.musician.user.avatar_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-semibold">{booking.musician?.user?.full_name}</p>
            <p className="text-sm text-gray-500">{new Date(booking.event_date).toLocaleDateString()}</p>
          </div>
        </div>

        <h1 className="mb-2 text-xl font-bold">How was your experience?</h1>
        <div className="mb-4 flex justify-center">
          <StarRating value={rating} interactive size="lg" onChange={setRating} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <textarea
            rows={5}
            placeholder="Tell others about your experience…"
            {...register('reviewText', { required: 'Tell us about your experience', minLength: { value: 20, message: 'Min 20 characters' } })}
            className="w-full rounded-lg border px-3 py-2"
          />
          {errors.reviewText && <p className="mt-1 text-xs text-red-600">{errors.reviewText.message}</p>}
          <button
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      </div>
    </div>
  );
};
