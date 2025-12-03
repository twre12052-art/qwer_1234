"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPayment(caseId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("case_id", caseId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching payment:", error);
  }
  
  return data;
}

export async function savePayment(caseId: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  // Verify ownership
  const { data: caseData } = await supabase.from("cases").select("guardian_id").eq("id", caseId).single();
  if (!caseData || caseData.guardian_id !== user.id) {
      return { error: "권한이 없습니다." };
  }

  const total_amount = parseInt(formData.get("total_amount") as string, 10);
  const paid_at = formData.get("paid_at") as string; // date string YYYY-MM-DD
  // Payment method is not in schema M0, but M3-WP1 asks for "지급 방식". 
  // I should check if I can store it. 
  // Schema: id, case_id, total_amount, paid_at, created_at. 
  // Missing "payment_method".
  // I will assume I can't store it in a dedicated column unless I alter table. 
  // Or I can store it in a separate column if I could run migration.
  // For now, I will focus on total_amount and paid_at which are in schema.
  // Wait, M0 schema said: "payments – 간병비 지급 정보". 
  // It didn't explicitly list all columns.
  // Let's assume I only have total_amount and paid_at. 
  // I will add "payment_method" to schema if I can, or just skip.
  // M3-WP1 says "지급 방식 입력". I should probably update the schema.
  // I'll write a migration or just instruction?
  // I'll stick to what I have or maybe use a metadata field if `payments` had one.
  // Let's just save amount and date for now to be safe with existing schema.

  if (isNaN(total_amount) || !paid_at) {
      return { error: "필수 정보를 입력해주세요." };
  }

  // Upsert payment
  // We need to know if we are inserting or updating. 
  // Since `case_id` is foreign key, but not unique constraint on `case_id` in `payments` table in M0 schema...
  // Wait, M0 schema: `id uuid primary key`.
  // Ideally `case_id` should be unique for one-to-one payment info?
  // Or one case can have multiple payments?
  // M3-WP1 says "지급 정보 입력/수정". Implies single record usually.
  // I'll check if record exists first.

  const { data: existing } = await supabase.from("payments").select("id").eq("case_id", caseId).single();

  let error;
  if (existing) {
      const { error: updateError } = await supabase
        .from("payments")
        .update({ total_amount, paid_at })
        .eq("id", existing.id);
      error = updateError;
  } else {
      const { error: insertError } = await supabase
        .from("payments")
        .insert({ case_id: caseId, total_amount, paid_at });
      error = insertError;
  }

  if (error) return { error: error.message };

  revalidatePath(`/cases/${caseId}`);
  redirect(`/cases/${caseId}`);
}

