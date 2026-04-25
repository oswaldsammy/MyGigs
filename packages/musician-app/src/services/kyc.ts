import { supabase } from '@mygigs/shared';
import type { KycDocumentRow, KycDocType } from '@mygigs/shared';

export const listMyDocs = async (): Promise<KycDocumentRow[]> => {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return [];
  const { data } = await supabase.from('kyc_documents').select('*').eq('musician_id', uid)
    .order('reviewed_at', { ascending: false, nullsFirst: false });
  return (data ?? []) as KycDocumentRow[];
};

export const submitDoc = async (docType: KycDocType, fileUrl: string) => {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) throw new Error('Not authenticated');
  const { error } = await supabase.from('kyc_documents').insert({
    musician_id: uid,
    doc_type: docType,
    file_url: fileUrl,
    status: 'pending',
  });
  if (error) throw error;
  await supabase.from('musician_profiles').update({ kyc_status: 'submitted' }).eq('id', uid);
};
