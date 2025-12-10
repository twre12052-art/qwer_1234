"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCaseByToken } from "@/modules/caregiver/actions";

// 보호자용: 본인 케이스의 간병일지 조회 (RLS 적용)
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

// 간병인용: 토큰 기반 간병일지 조회 (RLS 우회)
export async function getCareLogsByToken(token: string) {
  // 1. 토큰 검증
  const res = await getCaseByToken(token);
  if (res.error || !res.caseData) {
    return [];
  }
  
  // 2. adminSupabase로 간병일지 조회
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("care_logs")
    .select("*")
    .eq("case_id", res.caseData.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching logs by token:", error);
    return [];
  }
  return data;
}

// 보호자용: 특정 날짜 간병일지 조회 (RLS 적용)
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

// 간병인용: 토큰 기반 특정 날짜 간병일지 조회 (RLS 우회)
export async function getCareLogByToken(token: string, date: string) {
  // 1. 토큰 검증
  const res = await getCaseByToken(token);
  if (res.error || !res.caseData) {
    return null;
  }
  
  // 2. adminSupabase로 간병일지 조회
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("care_logs")
    .select("*")
    .eq("case_id", res.caseData.id)
    .eq("date", date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching log by token:", error);
  }
  return data;
}

export async function upsertCareLog(token: string, date: string, formData: FormData, isAdminUser: boolean = false) {
  // 1. Validate Token & Date Range
  const res = await getCaseByToken(token);
  if (res.error || !res.caseData) {
      return { error: "유효하지 않은 접근입니다." };
  }
  const { caseData } = res;

  // 2. 서명이 있는 일지는 수정 불가 (어드민 제외)
  if (!isAdminUser) {
    const existingLog = await getCareLogByToken(token, date);
    if (existingLog?.signature_data) {
      return { error: "서명이 완료된 일지는 수정할 수 없습니다. 수정이 필요한 경우 고객센터(1577-0000)로 연락주세요." };
    }
  }

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

  // 서명 데이터 가져오기
  const signatureData = formData.get("signature") as string;
  // 빈 문자열이거나 "null" 문자열인 경우 null로 처리
  const signature = signatureData && signatureData !== "" && signatureData !== "null" ? signatureData : null;

  // adminSupabase 사용 (간병인은 인증되지 않은 사용자이므로 RLS 우회 필요)
  const adminSupabase = createAdminClient();
  
  // signature_data 컬럼이 있는지 확인하고, 없으면 서명 없이 저장
  const upsertData: any = {
    case_id: caseData.id,
    date: date,
    content: combinedContent,
    is_active: true,
    updated_at: new Date().toISOString()
  };
  
  // signature_data 컬럼이 존재하는 경우에만 추가
  // 마이그레이션이 아직 실행되지 않은 경우를 대비
  if (signature) {
    upsertData.signature_data = signature;
  }
  
  const { error } = await adminSupabase
    .from("care_logs")
    .upsert(upsertData, { onConflict: 'case_id,date' });

  if (error) {
    console.error("간병일지 저장 에러:", error);
    return { error: error.message };
  }

  revalidatePath(`/caregiver/${token}/logs`);
  revalidatePath(`/caregiver/${token}/logs/${date}`);
  redirect(`/caregiver/${token}/logs`);
}

