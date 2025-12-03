"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCaseByToken } from "@/modules/caregiver/actions";

export async function getCareLogs(caseId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("care_logs")
    .select("*")
    .eq("case_id", caseId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
  return data;
}

export async function getCareLog(caseId: string, date: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("care_logs")
    .select("*")
    .eq("case_id", caseId)
    .eq("date", date)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error("Error fetching log:", error);
  }
  return data;
}

export async function upsertCareLog(token: string, date: string, formData: FormData) {
  // 1. Validate Token & Date Range
  const res = await getCaseByToken(token);
  if (res.error || !res.caseData) {
      return { error: "유효하지 않은 접근입니다." };
  }
  const { caseData } = res;

  // Date Validation (M2-WP4)
  const targetDate = new Date(date);
  const startDate = new Date(caseData.start_date);
  const endDate = new Date(caseData.end_date_final || caseData.end_date_expected);
  
  // Normalize to YYYY-MM-DD for comparison to avoid time issues
  const targetStr = targetDate.toISOString().split('T')[0];
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  if (targetStr < startStr || targetStr > endStr) {
      return { error: "작성할 수 없는 날짜입니다." };
  }
  
  // If case is completed/ended, is it allowed to edit? 
  // M2-WP4: "조기 종료된 이후 날짜는 비활성". "종료된 케이스에서 추가 작성 시도 시 안내"
  // If date is within range, it should be fine even if today > end_date (backfill).
  // But if date > end_date_final, it's blocked by above check.

  const content = formData.get("content") as string;
  // Checkbox items? M2-WP3 mentions checkboxes. 
  // Schema only has `content text`. 
  // I should probably store JSON in content or just text summary.
  // For M2, let's append checkboxes to text or just use text area for simplicity if schema is fixed.
  // Schema: `content text`. 
  // M2-WP3 Scope: "체크박스(식사 보조...)", "메모 텍스트 영역".
  // I will combine them into the text field or update schema to jsonb? 
  // M0 schema says `content text`. I will stick to text for now (e.g. "[식사] [투약] \n 메모...").
  
  const checklist = [];
  if (formData.get("meal") === "on") checklist.push("식사 보조");
  if (formData.get("position") === "on") checklist.push("체위 변경");
  if (formData.get("medication") === "on") checklist.push("투약");
  if (formData.get("mobility") === "on") checklist.push("이동 도움");
  if (formData.get("toilet") === "on") checklist.push("배변/배뇨 도움");

  const combinedContent = `[수행 항목]\n${checklist.join(", ")}\n\n[메모]\n${content}`;

  const supabase = createClient();
  const { error } = await supabase
    .from("care_logs")
    .upsert({
        case_id: caseData.id,
        date: date,
        content: combinedContent,
        is_active: true,
        updated_at: new Date().toISOString()
    }, { onConflict: 'case_id, date' });

  if (error) return { error: error.message };

  revalidatePath(`/caregiver/${token}/logs`);
  redirect(`/caregiver/${token}/logs`);
}

