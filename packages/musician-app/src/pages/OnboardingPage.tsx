import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvailabilityGrid, FileUpload } from '@mygigs/shared';
import type { AvailabilityMap } from '@mygigs/shared';
import { getMyMusician, getMyUser, updateMyMusician, updateMyUser } from '../services/profile';
import { submitDoc } from '../services/kyc';
import { useToast } from '../contexts/ToastContext';

const GENRES = ['Jazz', 'Rock', 'Pop', 'Classical', 'Hip-Hop', 'Electronic', 'Country', 'Folk', 'Blues', 'R&B'];
const INSTRUMENTS = ['Guitar', 'Piano', 'Drums', 'Vocals', 'Saxophone', 'Violin', 'Bass', 'Trumpet', 'Cello'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Arabic'];

interface FormState {
  full_name: string;
  city: string;
  phone: string;
  bio: string;
  genres: string[];
  instruments: string[];
  languages: string[];
  hourly_rate: number;
  min_booking_hours: number;
  avatar_url: string | null;
  profile_video_url: string;
  sample_tracks: { title: string; url: string }[];
  availability: AvailabilityMap;
  id_doc_url: string | null;
  cert_doc_url: string | null;
}

const empty: FormState = {
  full_name: '', city: '', phone: '',
  bio: '', genres: [], instruments: [], languages: [],
  hourly_rate: 50, min_booking_hours: 2,
  avatar_url: null, profile_video_url: '',
  sample_tracks: [], availability: {},
  id_doc_url: null, cert_doc_url: null,
};

export const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const u = await getMyUser();
      const m = await getMyMusician();
      setState((s) => ({
        ...s,
        full_name: u?.full_name ?? '',
        city: u?.city ?? '',
        phone: u?.phone ?? '',
        bio: m?.bio ?? '',
        genres: m?.genres ?? [],
        instruments: m?.instruments ?? [],
        languages: m?.languages ?? [],
        hourly_rate: m?.hourly_rate ?? 50,
        min_booking_hours: m?.min_booking_hours ?? 2,
        avatar_url: u?.avatar_url ?? null,
        profile_video_url: m?.profile_video_url ?? '',
        sample_tracks: m?.sample_tracks ?? [],
        availability: (m?.availability as AvailabilityMap) ?? {},
      }));
    })();
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setState((s) => ({ ...s, [k]: v }));

  const toggleArr = (k: 'genres' | 'instruments' | 'languages', v: string) => {
    const arr = state[k];
    set(k, arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const persistStep = async () => {
    if (step === 1) {
      await updateMyUser({ full_name: state.full_name, city: state.city, phone: state.phone });
    } else if (step === 2) {
      await updateMyMusician({
        bio: state.bio, genres: state.genres, instruments: state.instruments,
        languages: state.languages, hourly_rate: state.hourly_rate, min_booking_hours: state.min_booking_hours,
      });
    } else if (step === 3) {
      if (state.avatar_url) await updateMyUser({ avatar_url: state.avatar_url });
      await updateMyMusician({
        profile_video_url: state.profile_video_url || null,
        sample_tracks: state.sample_tracks,
      });
    } else if (step === 4) {
      if (state.id_doc_url) await submitDoc('id', state.id_doc_url);
      if (state.cert_doc_url) await submitDoc('certificate', state.cert_doc_url);
    } else if (step === 5) {
      await updateMyMusician({ availability: state.availability });
    }
  };

  const next = async () => {
    try {
      await persistStep();
      setStep((s) => Math.min(s + 1, 6));
    } catch (e) {
      toast('error', (e as Error).message);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await updateMyMusician({ kyc_status: 'submitted' });
      toast('success', 'Profile submitted for review!');
      navigate('/');
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Step {step} of 6</span>
          <span>{Math.round((step / 6) * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full bg-brand-400 text-black transition-all" style={{ width: `${(step / 6) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl bg-elev p-6 shadow-sm">
        {step === 1 && (
          <Step title="Basic info">
            <Input label="Full name" value={state.full_name} onChange={(v) => set('full_name', v)} />
            <Input label="City" value={state.city} onChange={(v) => set('city', v)} />
            <Input label="Phone" value={state.phone} onChange={(v) => set('phone', v)} />
          </Step>
        )}

        {step === 2 && (
          <Step title="Profile">
            <div>
              <Label>Bio (min 100 characters)</Label>
              <textarea rows={5} value={state.bio} onChange={(e) => set('bio', e.target.value)}
                className="w-full rounded-lg border px-3 py-2" />
            </div>
            <Chips label="Genres" options={GENRES} selected={state.genres} onToggle={(v) => toggleArr('genres', v)} />
            <Chips label="Instruments" options={INSTRUMENTS} selected={state.instruments} onToggle={(v) => toggleArr('instruments', v)} />
            <Chips label="Languages" options={LANGUAGES} selected={state.languages} onToggle={(v) => toggleArr('languages', v)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Hourly rate" type="number" value={state.hourly_rate} onChange={(v) => set('hourly_rate', Number(v))} />
              <Input label="Min booking hours" type="number" value={state.min_booking_hours} onChange={(v) => set('min_booking_hours', Number(v))} />
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title="Media">
            <div>
              <Label>Profile photo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-line">
                  {state.avatar_url && <img src={state.avatar_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <FileUpload folder="avatars" accept="image/*" label="Upload photo"
                  onUploaded={(url) => set('avatar_url', url)} />
              </div>
            </div>
            <Input label="Profile video URL (YouTube/Vimeo embed)"
              value={state.profile_video_url} onChange={(v) => set('profile_video_url', v)} />
            <div>
              <Label>Sample tracks (up to 5)</Label>
              {state.sample_tracks.map((t, i) => (
                <div key={i} className="mb-2 flex items-center gap-2">
                  <input value={t.title} placeholder="Title"
                    onChange={(e) => {
                      const next = [...state.sample_tracks];
                      next[i] = { ...next[i], title: e.target.value };
                      set('sample_tracks', next);
                    }}
                    className="flex-1 rounded-lg border px-2 py-1 text-sm" />
                  <button type="button" onClick={() => set('sample_tracks', state.sample_tracks.filter((_, j) => j !== i))}
                    className="text-xs text-red-400 hover:underline">Remove</button>
                </div>
              ))}
              {state.sample_tracks.length < 5 && (
                <FileUpload folder="tracks" accept="audio/*" label="Add track"
                  onUploaded={(url) =>
                    set('sample_tracks', [...state.sample_tracks, { title: 'Untitled', url }])
                  } />
              )}
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step title="KYC documents">
            <div>
              <Label>ID document (required)</Label>
              {state.id_doc_url ? (
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-green-700">
                  ✓ Uploaded · <button onClick={() => set('id_doc_url', null)} className="underline">remove</button>
                </div>
              ) : (
                <FileUpload folder="kyc" label="Upload ID" onUploaded={(url) => set('id_doc_url', url)} />
              )}
            </div>
            <div>
              <Label>Professional certificate (optional)</Label>
              {state.cert_doc_url ? (
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-green-700">
                  ✓ Uploaded · <button onClick={() => set('cert_doc_url', null)} className="underline">remove</button>
                </div>
              ) : (
                <FileUpload folder="kyc" label="Upload certificate" onUploaded={(url) => set('cert_doc_url', url)} />
              )}
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title="Availability">
            <p className="mb-3 text-sm text-gray-500">Tap slots to mark when you're available.</p>
            <AvailabilityGrid value={state.availability} onChange={(v) => set('availability', v)} />
          </Step>
        )}

        {step === 6 && (
          <Step title="Review & submit">
            <ReviewRow k="Name" v={state.full_name} />
            <ReviewRow k="City" v={state.city} />
            <ReviewRow k="Bio" v={state.bio.slice(0, 80) + (state.bio.length > 80 ? '…' : '')} />
            <ReviewRow k="Genres" v={state.genres.join(', ') || '—'} />
            <ReviewRow k="Instruments" v={state.instruments.join(', ') || '—'} />
            <ReviewRow k="Hourly rate" v={`${state.hourly_rate}/hr`} />
            <ReviewRow k="Sample tracks" v={`${state.sample_tracks.length} uploaded`} />
            <ReviewRow k="ID document" v={state.id_doc_url ? '✓ Uploaded' : '✗ Missing'} />
          </Step>
        )}

        <div className="mt-6 flex justify-between">
          <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">
            Back
          </button>
          {step < 6 ? (
            <button onClick={next} className="rounded-lg bg-brand-400 text-black px-4 py-2 text-sm text-white">Next</button>
          ) : (
            <button onClick={submit} disabled={submitting}
              className="rounded-lg bg-brand-400 text-black px-4 py-2 text-sm text-white disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Step = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold">{title}</h2>
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="mb-1 block text-sm font-medium">{children}</label>
);

const Input = ({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: string) => void; type?: string }) => (
  <div>
    <Label>{label}</Label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-3 py-2" />
  </div>
);

const Chips = ({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) => (
  <div>
    <Label>{label}</Label>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button type="button" key={o} onClick={() => onToggle(o)}
            className={`rounded-full px-3 py-1 text-sm ${on ? 'bg-brand-400 text-black' : 'bg-elev text-gray-300 hover:bg-line'}`}>
            {o}
          </button>
        );
      })}
    </div>
  </div>
);

const ReviewRow = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between border-b py-2 text-sm">
    <span className="text-gray-500">{k}</span><span className="font-medium">{v || '—'}</span>
  </div>
);
