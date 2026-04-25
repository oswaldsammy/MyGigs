import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileUpload, useAuth } from '@mygigs/shared';
import type { UserRow } from '@mygigs/shared';
import { getMyUser, updateMyUser } from '../services/profile';
import { useToast } from '../contexts/ToastContext';

interface Form { full_name: string; city: string; phone: string }

export const ProfilePage = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [me, setMe] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm<Form>();

  useEffect(() => {
    getMyUser().then((u) => {
      setMe(u);
      if (u) reset({ full_name: u.full_name ?? '', city: u.city ?? '', phone: u.phone ?? '' });
    });
  }, [reset]);

  const onSave = async (v: Form) => {
    setSaving(true);
    try {
      await updateMyUser({ full_name: v.full_name, city: v.city, phone: v.phone });
      toast('success', 'Profile updated');
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!me) return <div className="p-12 text-center text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-6 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-bold">Profile</h1>
        <div className="mb-4 flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
            {me.avatar_url && <img src={me.avatar_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <FileUpload
            folder="avatars"
            accept="image/*"
            label="Change photo"
            onUploaded={async (url) => {
              await updateMyUser({ avatar_url: url });
              setMe({ ...me, avatar_url: url });
              toast('success', 'Avatar updated');
            }}
          />
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <Field label="Full name">
            <input {...register('full_name')} className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="City">
            <input {...register('city')} className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Phone">
            <input {...register('phone')} className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <button disabled={saving}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="mb-2 font-semibold text-red-600">Account</h2>
        <button onClick={signOut} className="text-sm text-red-600 hover:underline">Sign out</button>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block text-sm font-medium">{label}</label>
    {children}
  </div>
);
