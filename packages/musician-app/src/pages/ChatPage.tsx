import { Link, useParams } from 'react-router-dom';
import { MessageThread, useAuth } from '@mygigs/shared';

export const ChatPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  if (!bookingId || !user) return <div className="p-12 text-center text-gray-500">Loading…</div>;
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link to={`/gigs/${bookingId}`} className="mb-3 inline-block text-sm text-brand-400 hover:underline">
        ← Back to gig
      </Link>
      <MessageThread bookingId={bookingId} currentUserId={user.id} role="musician" />
    </div>
  );
};
