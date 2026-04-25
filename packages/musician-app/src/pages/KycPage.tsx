import { useEffect, useState } from 'react';
import { FileUpload } from '@mygigs/shared';
import type { KycDocumentRow, KycDocType, MusicianProfileRow } from '@mygigs/shared';
import { listMyDocs, submitDoc } from '../services/kyc';
import { getMyMusician } from '../services/profile';
import { useToast } from '../contexts/ToastContext';

const TYPES: { type: KycDocType; label: string }[] = [
  { type: 'id', label: 'ID document' },
  { type: 'certificate', label: 'Professional certificate' },
  { type: 'portfolio', label: 'Portfolio' },
  { type: 'bank', label: 'Bank account details' },
];

export const KycPage = () => {
  const { toast } = useToast();
  const [m, setM] = useState<MusicianProfileRow | null>(null);
  const [docs, setDocs] = useState<KycDocumentRow[]>([]);

  const reload = async () => {
    setM(await getMyMusician());
    setDocs(await listMyDocs());
  };

  useEffect(() => { void reload(); }, []);

  const overall = m?.kyc_status;
  const banner = overall === 'approved'
    ? { c: 'bg-green-50 border-green-200 text-green-800', t: 'Identity verified' }
    : overall === 'rejected'
    ? { c: 'bg-red-50 border-red-200 text-red-800', t: 'Action required — please re-upload rejected documents' }
    : { c: 'bg-amber-50 border-amber-200 text-amber-800', t: 'Under review — usually takes 1–2 business days' };

  const upload = async (type: KycDocType, url: string) => {
    try {
      await submitDoc(type, url);
      toast('success', 'Document submitted');
      await reload();
    } catch (e) {
      toast('error', (e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-bold">Verification</h1>

      <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${banner.c}`}>{banner.t}</div>

      <div className="space-y-3">
        {TYPES.map(({ type, label }) => {
          const latest = docs.filter((d) => d.doc_type === type).sort((a, b) => (b.reviewed_at ?? '').localeCompare(a.reviewed_at ?? ''))[0];
          return (
            <div key={type} className="rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{label}</p>
                  {latest ? (
                    <p className="text-sm text-gray-500">
                      Status:{' '}
                      <span className={
                        latest.status === 'approved' ? 'text-green-600' :
                        latest.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                      }>
                        {latest.status}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Not uploaded</p>
                  )}
                </div>
                <FileUpload folder="kyc" label={latest?.status === 'rejected' ? 'Re-upload' : latest ? 'Replace' : 'Upload'}
                  onUploaded={(url) => upload(type, url)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
