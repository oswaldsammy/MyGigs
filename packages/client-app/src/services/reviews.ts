import { supabase } from '@mygigs/shared';

export const submitReview = async (
  bookingId: string,
  musicianId: string,
  rating: number,
  reviewText: string,
) => {
  const { data: u } = await supabase.auth.getUser();
  const clientId = u.user?.id;
  if (!clientId) throw new Error('Not authenticated');

  const { error } = await supabase.from('reviews').insert({
    booking_id: bookingId,
    client_id: clientId,
    musician_id: musicianId,
    rating,
    review_text: reviewText,
  });
  if (error) throw error;

  const { data: all } = await supabase
    .from('reviews')
    .select('rating')
    .eq('musician_id', musicianId);
  const ratings = (all ?? []).map((r: any) => r.rating as number);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  await supabase
    .from('musician_profiles')
    .update({ avg_rating: +avg.toFixed(2), total_reviews: ratings.length })
    .eq('id', musicianId);

  await supabase.from('notifications').insert({
    user_id: musicianId,
    type: 'review.new',
    title: 'You received a new review',
    body: `${rating}-star review`,
    meta: { booking_id: bookingId },
  });
};

export const findReviewForBooking = async (bookingId: string) => {
  const { data } = await supabase.from('reviews').select('id').eq('booking_id', bookingId).maybeSingle();
  return data;
};
