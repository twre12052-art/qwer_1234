"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
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
    const adminSupabase = createAdminClient(); // RLS 우회용

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
    const address = formData.get("address") as string;
    
    const caregiver_account_bank = formData.get("caregiver_account_bank") as string;
    const caregiver_account_number = formData.get("caregiver_account_number") as string;

    if (!caregiver_name || !caregiver_phone || !caregiver_birth_date || !caregiver_account_bank || !caregiver_account_number) {
        return { error: "필수 정보를 모두 입력해주세요." };
    }

    // Update case (adminSupabase로 RLS 우회)
    const { data: updateResult, error } = await adminSupabase
        .from("cases")
        .update({
            caregiver_name, 
            caregiver_phone,
            caregiver_birth_date,
            caregiver_account_bank,
            caregiver_account_number,
            caregiver_agreed_at: new Date().toISOString(),
            status: "IN_PROGRESS",
            updated_at: new Date().toISOString()
        })
        .eq("id", caseId)
        .select();

    if (error) {
        console.error("간병인 동의 처리 에러:", error);
        return { error: error.message };
    }

    if (!updateResult || updateResult.length === 0) {
        console.error("케이스 업데이트 실패: 결과 없음");
        return { error: "케이스 업데이트에 실패했습니다." };
    }

    console.log("✅ 간병인 동의 완료:", {
        caseId,
        status: updateResult[0].status,
        caregiver_agreed_at: updateResult[0].caregiver_agreed_at
    });

    // 보호자 페이지도 revalidate
    revalidatePath(`/cases`);
    revalidatePath(`/cases/${caseId}`);
    revalidatePath(`/caregiver/${token}`);
    
    redirect(`/caregiver/${token}/logs`);
}
