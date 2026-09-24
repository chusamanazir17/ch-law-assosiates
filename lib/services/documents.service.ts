import { createClient } from "@/lib/supabase/server";
import type { CaseDocument } from "@/types/office";

export async function listCaseDocuments(caseId: string): Promise<CaseDocument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_documents")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[DocumentsService] listCaseDocuments error:", error);
    throw new Error(`Failed to load case documents: ${error.message}`);
  }

  return (data || []) as CaseDocument[];
}

export async function recordCaseDocument(data: {
  case_id: string;
  title: string;
  document_type: string;
  file_url: string;
  storage_path?: string | null;
  uploaded_by?: string | null;
}): Promise<CaseDocument> {
  const supabase = await createClient();
  const { data: doc, error } = await supabase
    .from("case_documents")
    .insert({
      case_id: data.case_id,
      title: data.title.trim(),
      document_type: data.document_type || "Pleading",
      file_url: data.file_url,
      storage_path: data.storage_path || null,
      uploaded_by: data.uploaded_by || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[DocumentsService] recordCaseDocument error:", error);
    throw new Error(`Failed to record document: ${error.message}`);
  }

  return doc as CaseDocument;
}

export async function deleteCaseDocument(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("case_documents").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete document: ${error.message}`);
}
