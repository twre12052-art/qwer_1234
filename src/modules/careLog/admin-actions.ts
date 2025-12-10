"use server";

import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/modules/shared/lib/admin-check";

/**
 * 어드민용: 간병일지 삭제
 */
export async function deleteCareLogAsAdmin(caseId: string, logId: string) {
  // 어드민 권한 확인
  const admin = await isAdmin();
  if (!admin) {
    return { error: "어드민 권한이 필요합니다." };
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("care_logs")
    .delete()
    .eq("id", logId)
    .eq("case_id", caseId);

  if (error) {
    console.error("간병일지 삭제 오류:", error);
    return { error: error.message };
  }

  revalidatePath(`/cases/${caseId}`);
  return { success: true };
}

/**
 * 어드민용: 간병일지 수정
 */
export async function updateCareLogAsAdmin(
  caseId: string,
  logId: string,
  formData: FormData
) {
  // 어드민 권한 확인
  const admin = await isAdmin();
  if (!admin) {
    return { error: "어드민 권한이 필요합니다." };
  }

  const content = formData.get("content") as string;
  const signatureData = formData.get("signature") as string;
  const signature = signatureData && signatureData !== "" && signatureData !== "null" ? signatureData : null;

  const checklist = [];
  if (formData.get("meal") === "on") checklist.push("식사 보조");
  if (formData.get("position") === "on") checklist.push("체위 변경");
  if (formData.get("medication") === "on") checklist.push("투약");
  if (formData.get("mobility") === "on") checklist.push("이동 도움");
  if (formData.get("toilet") === "on") checklist.push("배변/배뇨 도움");

  const combinedContent = `[수행 항목]\n${checklist.join(", ")}\n\n[메모]\n${content}`;

  const adminSupabase = createAdminClient();
  const updateData: any = {
    content: combinedContent,
    updated_at: new Date().toISOString(),
  };

  if (signature) {
    updateData.signature_data = signature;
  }

  const { error } = await adminSupabase
    .from("care_logs")
    .update(updateData)
    .eq("id", logId)
    .eq("case_id", caseId);

  if (error) {
    console.error("간병일지 수정 오류:", error);
    return { error: error.message };
  }

  revalidatePath(`/cases/${caseId}`);
  return { success: true };
}

