import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '@mygigs/shared';
import { listMusicianConversations, Conversation } from '../services/conversations';

export const MessagesListPage = () => {
  const [convs, setConvs] = useState<Conversation[] | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { listMusicianConversations().then(setConvs); }, []);

  const sorted = useMemo(() => {
    if (!convs) return null;
    const filtered = convs.filter((c) => c.otherName.toLowerCase().includes(search.toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (a.unread !== b.unread) return b.unread - a.unread;
      const at = a.lastTime ? new Date(a.lastTime).getTime() : 0;
      const bt = b.lastTime ? new Date(b.lastTime).getTime() : 0;
      return bt - at;
    });
  }, [convs, search]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-bold">Messages</h1>
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by client name…"
        className="mb-4 w-full rounded-lg border px-3 py-2 text-sm" />
      {sorted === null ? (
        <p className="text-gray-500">Loading…</p>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-12 text-center text-gray-500">No messages yet.</div>
      ) : (
        <div className="divide-y rounded-xl border bg-elev">
          {sorted.map((c) => (
            <Link key={c.bookingId} to={`/messages/${c.bookingId}`}
              className="flex items-center gap-3 p-4 hover:bg-surface">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-line">
                {c.otherAvatar && <img src={c.otherAvatar} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate font-semibold">{c.otherName}</p>
                  <span className="text-xs text-gray-400">
                    {c.lastTime ? new Date(c.lastTime).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="truncate text-sm text-gray-500">
                  {c.lastMessage ?? `Booking ${formatDate(c.eventDate)}`}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="rounded-full bg-brand-400 text-black px-2 py-0.5 text-xs text-white">{c.unread}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
