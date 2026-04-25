import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AvailabilityGrid, FileUpload, useAuth } from '@mygigs/shared';
import type { AvailabilityMap, MusicianProfileRow, UserRow } from '@mygigs/shared';
import { getMyMusician, getMyUser, updateMyMusician, updateMyUser } from '../services/profile';
import { useToast } from '../contexts/ToastContext';

const GENRES = ['Jazz', 'Rock', 'Pop', 'Classical', 'Hip-Hop', 'Electronic', 'Country', 'Folk', 'Blues', 'R&B'];
const INSTRUMENTS = ['Guitar', 'Piano', 'Drums', 'Vocals', 'Saxophone', 'Violin', 'Bass', 'Trumpet'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Arabic'];

export const EditProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [me, setMe] = useState<UserRow | null>(null);
  const [m, setM] = useState<MusicianProfileRow | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setMe(await getMyUser());
      setM(await getMyMusician());
    })();
  }, []);

  if (!me || !m) return <div className="p-12 text-center text-gray-500">Loading…</div>;

  const setM2 = (patch: Partial<MusicianProfileRow>) => setM({ ...m, ...patch });
  const setMe2 = (patch: Partial<UserRow>) => setMe({ ...me, ...patch });

  const saveSection = async (key: string, fn: () => Promise<void>) => {
    setSavingSection(key);
    try { await fn(); toast('success', `${key} updated`); }
    catch (e) { toast('error', (e as Error).message); }
    finally { setSavingSection(null); }
  };

  const toggle = (k: 'genres' | 'instruments' | 'languages', v: string) => {
    const arr = (m[k] ?? []) as string[];
    setM2({ [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] } as any);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      {m.kyc_status === 'rejected' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Your KYC was rejected. <Link to="/kyc" className="underline">Re-upload documents →</Link>
        </div>
      )}

      {user && (
        <Link to={`/profile-preview/${user.id}`} className="block text-sm text-brand-600 hover:underline">
          See how clients see your profile →
        </Link>
      )}

      <Section title="Photo" busy={savingSection === 'Photo'}>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
            {me.avatar_url && <img src={me.avatar_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <FileUpload folder="avatars" accept="image/*" label="Change photo"
            onUploaded={async (url) => {
              await updateMyUser({ avatar_url: url });
              setMe2({ avatar_url: url });
              toast('success', 'Photo updated');
            }} />
        </div>
      </Section>

      <Section title="Basic info" busy={savingSection === 'Basic'}>
        <Field label="Full name">
          <input value={me.full_name ?? ''} onChange={(e) => setMe2({ full_name: e.target.value })}
            className="w-full rounded-lg border px-3 py-2" />
        </Field>
        <Field label="City">
          <input value={me.city ?? ''} onChange={(e) => setMe2({ city: e.target.value })}
            className="w-full rounded-lg border px-3 py-2" />
        </Field>
        <Field label="Phone">
          <input value={me.phone ?? ''} onChange={(e) => setMe2({ phone: e.target.value })}
            className="w-full rounded-lg border px-3 py-2" />
        </Field>
        <SaveBtn onClick={() => saveSection('Basic', () => updateMyUser({ full_name: me.full_name, city: me.city, phone: me.phone }))} />
      </Section>

      <Section title="Bio & rates">
        <Field label="Bio">
          <textarea rows={5} value={m.bio ?? ''} onChange={(e) => setM2({ bio: e.target.value })}
            className="w-full rounded-lg border px-3 py-2" />
        </Field>
        <Chips label="Genres" options={GENRES} selected={m.genres ?? []} onToggle={(v) => toggle('genres', v)} />
        <Chips label="Instruments" options={INSTRUMENTS} selected={m.instruments ?? []} onToggle={(v) => toggle('instruments', v)} />
        <Chips label="Languages" options={LANGUAGES} selected={m.languages ?? []} onToggle={(v) => toggle('languages', v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hourly rate">
            <input type="number" value={m.hourly_rate ?? 0} onChange={(e) => setM2({ hourly_rate: Number(e.target.value) })}
              className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Min booking hours">
            <input type="number" value={m.min_booking_hours ?? 1} onChange={(e) => setM2({ min_booking_hours: Number(e.target.value) })}
              className="w-full rounded-lg border px-3 py-2" />
          </Field>
        </div>
        <SaveBtn onClick={() => saveSection('Bio', () => updateMyMusician({
          bio: m.bio, genres: m.genres, instruments: m.instruments, languages: m.languages,
          hourly_rate: m.hourly_rate, min_booking_hours: m.min_booking_hours,
        }))} />
      </Section>

      <Section title="Media">
        <Field label="Profile video URL">
          <input value={m.profile_video_url ?? ''} onChange={(e) => setM2({ profile_video_url: e.target.value })}
            className="w-full rounded-lg border px-3 py-2" />
        </Field>
        <div>
          <label className="mb-1 block text-sm font-medium">Sample tracks</label>
          {(m.sample_tracks ?? []).map((t, i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <input value={t.title} onChange={(e) => {
                const arr = [...(m.sample_tracks ?? [])];
                arr[i] = { ...arr[i], title: e.target.value };
                setM2({ sample_tracks: arr });
              }} className="flex-1 rounded-lg border px-2 py-1 text-sm" />
              <button onClick={() => setM2({ sample_tracks: (m.sample_tracks ?? []).filter((_, j) => j !== i) })}
                className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          ))}
          {(m.sample_tracks ?? []).length < 5 && (
            <FileUpload folder="tracks" accept="audio/*" label="Add track"
              onUploaded={(url) => setM2({ sample_tracks: [...(m.sample_tracks ?? []), { title: 'Untitled', url }] })} />
          )}
        </div>
        <SaveBtn onClick={() => saveSection('Media', () => updateMyMusician({
          profile_video_url: m.profile_video_url, sample_tracks: m.sample_tracks,
        }))} />
      </Section>

      <Section title="Availability">
        <AvailabilityGrid value={(m.availability as AvailabilityMap) ?? {}}
          onChange={(v) => setM2({ availability: v as any })} />
        <SaveBtn onClick={() => saveSection('Availability', () => updateMyMusician({ availability: m.availability }))} />
      </Section>

      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="mb-2 font-semibold text-red-600">Account</h2>
        <button onClick={signOut} className="text-sm text-red-600 hover:underline">Sign out</button>
      </div>
    </div>
  );
};

const Section = ({ title, children, busy }: { title: string; children: React.ReactNode; busy?: boolean }) => (
  <div className="rounded-2xl bg-white p-6 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      {busy && <span className="text-xs text-gray-500">Saving…</span>}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block text-sm font-medium">{label}</label>
    {children}
  </div>
);

const Chips = ({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) => (
  <div>
    <label className="mb-1 block text-sm font-medium">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button type="button" key={o} onClick={() => onToggle(o)}
            className={`rounded-full px-3 py-1 text-sm ${on ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {o}
          </button>
        );
      })}
    </div>
  </div>
);

const SaveBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">Save</button>
);
