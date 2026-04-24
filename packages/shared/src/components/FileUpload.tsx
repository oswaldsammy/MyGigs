import { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Props {
  bucket?: string;
  folder: string;
  accept?: string;
  label?: string;
  onUploaded: (publicUrl: string, path: string) => void;
}

export const FileUpload = ({ bucket = 'mygigs-assets', folder, accept, label = 'Upload', onUploaded }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setProgress(0);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? 'anon';
      const path = `${folder}/${uid}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        cacheControl: '3600',
      });
      if (upErr) throw upErr;
      setProgress(100);
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded(pub.publicUrl, path);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setTimeout(() => setProgress(null), 800);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm hover:border-brand-600 hover:text-brand-600"
      >
        📎 {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = '';
        }}
      />
      {progress !== null && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded bg-gray-100">
          <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
