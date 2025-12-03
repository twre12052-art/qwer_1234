"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCaseByToken(token: string) {
  const supabase = createClient();
  
  // 1. Find token record
  const { data: tokenData, error: tokenError } = await supabase
    .from("case_tokens")
    .select("case_id, expires_at")
    .eq("token", token)
    .single();

  if (tokenError || !tokenData) {
    return { error: "유효하지 않은 링크입니다." };
  }

  // Check expiration if logic exists (M2-WP1 says "만료 여부 체크")
  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return { error: "유효기간이 지난 링크입니다." };
  }

  // 2. Get Case details
  const { data: caseData, error: caseError } = await supabase
    .from("cases")
    .select("*")
    .eq("id", tokenData.case_id)
    .single();

  if (caseError || !caseData) {
    return { error: "케이스를 찾을 수 없습니다." };
  }

  return { caseData };
}

export async function agreeCaregiver(token: string, caseId: string, formData: FormData) {
    const supabase = createClient();

    // Re-validate token just in case
    const { data: tokenData } = await supabase
        .from("case_tokens")
        .select("case_id")
        .eq("token", token)
        .single();
    
    if (!tokenData || tokenData.case_id !== caseId) {
        return { error: "잘못된 접근입니다." };
    }

    const caregiver_name = formData.get("caregiver_name") as string;
    const caregiver_phone = formData.get("caregiver_phone") as string;
    const caregiver_birth_date = formData.get("caregiver_birth_date") as string;
    // Address field is currently not in DB schema, but required by UI.
    // We'll skip saving it for now or store it if schema is updated.
    // For M2 MVP, we process other fields.
    const address = formData.get("address") as string;
    
    const caregiver_account_bank = formData.get("caregiver_account_bank") as string;
    const caregiver_account_number = formData.get("caregiver_account_number") as string;

    if (!caregiver_name || !caregiver_phone || !caregiver_birth_date || !caregiver_account_bank || !caregiver_account_number) {
        return { error: "필수 정보를 모두 입력해주세요." };
    }

    // Update case
    const { error } = await supabase
        .from("cases")
        .update({
            caregiver_name, 
            caregiver_phone,
            caregiver_birth_date,
            caregiver_account_bank,
            caregiver_account_number,
            caregiver_agreed_at: new Date().toISOString(),
            status: "IN_PROGRESS" 
        })
        .eq("id", caseId);

    if (error) return { error: error.message };

    revalidatePath(`/caregiver/${token}`);
    redirect(`/caregiver/${token}/logs`);
}
