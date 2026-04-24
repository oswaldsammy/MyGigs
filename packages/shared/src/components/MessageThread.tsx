import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { MessageRow } from '../types/database';
import { FileUpload } from './FileUpload';

interface Props {
  bookingId: string;
  currentUserId: string;
  role: 'client' | 'musician';
}

export const MessageThread = ({ bookingId, currentUserId, role }: Props) => {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });
      if (!active) return;
      setMessages((data ?? []) as MessageRow[]);
      setLoading(false);
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('booking_id', bookingId)
        .neq('sender_id', currentUserId);
    })();

    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as MessageRow]),
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [bookingId, currentUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async (content: string, fileUrl: string | null = null) => {
    if (!content.trim() && !fileUrl) return;
    setSending(true);
    const optimistic: MessageRow = {
      id: `tmp-${Date.now()}`,
      booking_id: bookingId,
      sender_id: currentUserId,
      content,
      file_url: fileUrl,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setInput('');
    const { error } = await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      content,
      file_url: fileUrl,
    });
    if (error) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
    }
    setSending(false);
  };

  const ownBubble = role === 'client' ? 'bg-purple-600 text-white' : 'bg-teal-600 text-white';

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    mine ? ownBubble : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {m.file_url && (
                    <a href={m.file_url} target="_blank" rel="noreferrer" className="mb-1 block underline opacity-80">
                      📎 Attachment
                    </a>
                  )}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <div className="flex-shrink-0">
            <FileUpload
              folder={`messages/${bookingId}`}
              label=""
              onUploaded={(url) => void send('(attachment)', url)}
            />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            placeholder="Type a message…"
            className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            disabled={sending || !input.trim()}
            onClick={() => void send(input)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
