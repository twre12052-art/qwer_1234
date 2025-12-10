"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";

export async function checkPdfRequirements(caseId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "로그인이 필요합니다." };

    // 1. Case Info
    const { data: caseData } = await supabase.from("cases").select("*").eq("id", caseId).single();
    if (!caseData) return { error: "케이스를 찾을 수 없습니다." };
    if (caseData.guardian_id !== user.id) return { error: "권한이 없습니다." };

    const errors = [];

    // 2. Check Agreements
    if (!caseData.guardian_agreed_at) errors.push("보호자 계약 동의가 필요합니다.");
    if (!caseData.caregiver_agreed_at) errors.push("간병인 동의가 필요합니다.");

    // 3. Check Logs - 간병 기간 내 모든 날짜에 대한 일지 작성 확인
    const startDate = new Date(caseData.start_date);
    const endDate = new Date(caseData.end_date_final || caseData.end_date_expected);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 간병 기간 내 날짜 수 계산 (오늘까지)
    let totalDays = 0;
    const date = new Date(startDate);
    while (date <= endDate && date <= today) {
      totalDays++;
      date.setDate(date.getDate() + 1);
    }
    
    // 작성된 일지 조회
    const { data: logs } = await supabase
        .from("care_logs")
        .select("date")
        .eq("case_id", caseId)
        .eq("is_active", true);
    
    const writtenDates = new Set(logs?.map(l => l.date) || []);
    
    if (!logs || logs.length === 0) {
      errors.push("작성된 간병일지가 없습니다.");
    } else if (writtenDates.size < totalDays) {
      const missingDays = totalDays - writtenDates.size;
      errors.push(`간병일지 작성 필요: ${missingDays}일의 일지가 아직 작성되지 않았습니다. (현재 ${writtenDates.size}/${totalDays}일 완료)`);
    }

    // 4. Check Payment
    const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();
    
    if (!payment) errors.push("지급 정보가 입력되지 않았습니다.");

    if (errors.length > 0) {
        return { missingRequirements: errors };
    }

    return { success: true };
}
