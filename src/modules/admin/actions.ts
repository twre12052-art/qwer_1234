"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Case, ActivityLog, User } from "@/modules/shared/types/db";
import { ACTIVITY_ACTIONS } from "@/modules/shared/types/db";

// ================================================
// Admin 권한 확인 헬퍼
// ================================================
async function checkAdminPermission() {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ checkAdminPermission: 사용자 없음');
    redirect("/login");
  }

  // adminSupabase 사용 (RLS 우회)
  const { data: userData, error: userError } = await adminSupabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log('🔍 checkAdminPermission:', {
    user_id: user.id,
    userData,
    userError,
  });

  if (!userData || userData.role !== 'admin') {
    console.error('❌ checkAdminPermission: Admin 권한 없음', userData);
    redirect("/cases"); // Admin 아니면 보호자 페이지로
  }

  console.log('✅ checkAdminPermission: Admin 권한 확인됨');
  return user;
}

// ================================================
// 전체 케이스 조회 (Admin 전용)
// ================================================
export async function getAllCases() {
  await checkAdminPermission();
  
  const adminSupabase = createAdminClient();
  
  // 전체 케이스 조회 (JOIN 없이 단순 조회)
  const { data: cases, error } = await adminSupabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Admin 케이스 조회 에러:", error);
    return [];
  }

  console.log(`✅ Admin 케이스 조회 성공: ${cases?.length || 0}건`);
  
  // 보호자 정보는 별도로 조회
  if (cases && cases.length > 0) {
    const guardianIds = [...new Set(cases.map(c => c.guardian_id))];
    const { data: users } = await adminSupabase
      .from("users")
      .select("id, name, full_name, phone, contact_email")
      .in("id", guardianIds);

    // 케이스에 보호자 정보 매핑
    const usersMap = new Map(users?.map(u => [u.id, u]) || []);
    const casesWithUsers = cases.map(c => ({
      ...c,
      users: usersMap.get(c.guardian_id),
    }));

    return casesWithUsers;
  }

  return cases || [];
}

// ================================================
// 케이스 상세 조회 (Admin 전용)
// ================================================
export async function getAdminCase(id: string) {
  await checkAdminPermission();
  
  const adminSupabase = createAdminClient();
  
  // 케이스 조회
  const { data: caseData, error } = await adminSupabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("❌ Admin 케이스 상세 조회 에러:", error);
    return null;
  }

  // 보호자 정보 별도 조회
  if (caseData) {
    const { data: userData } = await adminSupabase
      .from("users")
      .select("id, name, full_name, phone, contact_email")
      .eq("id", caseData.guardian_id)
      .single();

    return {
      ...caseData,
      users: userData,
    };
  }

  return caseData;
}

// ================================================
// 활동 로그 조회
// ================================================
export async function getActivityLogs(caseId: string): Promise<ActivityLog[]> {
  await checkAdminPermission();
  
  const adminSupabase = createAdminClient();
  
  const { data: logs, error } = await adminSupabase
    .from("activity_logs")
    .select(`
      *,
      users (
        name,
        full_name
      )
    `)
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("활동 로그 조회 에러:", error);
    return [];
  }

  return logs || [];
}

// ================================================
// 활동 로그 기록 헬퍼
// ================================================
async function logActivity(
  caseId: string,
  action: string,
  meta?: Record<string, any>
) {
  const user = await checkAdminPermission();
  const adminSupabase = createAdminClient();
  
  await adminSupabase
    .from("activity_logs")
    .insert({
      user_id: user.id,
      case_id: caseId,
      action,
      meta: meta || {},
    });
}

// ================================================
// 기간 수정 (과거 포함 - Admin만 가능)
// ================================================
export async function adminChangePeriod(
  caseId: string,
  startDate: string,
  endDate: string,
  reason?: string
) {
  await checkAdminPermission();
  const adminSupabase = createAdminClient();

  // 기존 케이스 정보 조회
  const { data: currentCase } = await adminSupabase
    .from("cases")
    .select("start_date, end_date_expected, end_date_final")
    .eq("id", caseId)
    .single();

  if (!currentCase) {
    return { error: "케이스를 찾을 수 없습니다." };
  }

  // 날짜 검증
  if (new Date(startDate) > new Date(endDate)) {
    return { error: "종료일은 시작일 이후여야 합니다." };
  }

  // 케이스 업데이트
  const { error } = await adminSupabase
    .from("cases")
    .update({
      start_date: startDate,
      end_date_expected: endDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId);

  if (error) {
    console.error("기간 수정 에러:", error);
    return { error: "기간 수정에 실패했습니다." };
  }

  // 활동 로그 기록
  await logActivity(caseId, ACTIVITY_ACTIONS.CHANGE_PERIOD, {
    before: {
      start_date: currentCase.start_date,
      end_date: currentCase.end_date_final || currentCase.end_date_expected,
    },
    after: {
      start_date: startDate,
      end_date: endDate,
    },
    reason: reason || "기간 조정",
  });

  revalidatePath("/admin/cases");
  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}`);
  
  return { success: true };
}

// ================================================
// 강제 종료 (Admin만 가능)
// ================================================
export async function adminForceEnd(
  caseId: string,
  reason: string
) {
  await checkAdminPermission();
  const adminSupabase = createAdminClient();

  if (!reason || reason.trim().length < 5) {
    return { error: "종료 사유를 5자 이상 입력해주세요." };
  }

  // 기존 상태 조회
  const { data: currentCase } = await adminSupabase
    .from("cases")
    .select("status")
    .eq("id", caseId)
    .single();

  if (!currentCase) {
    return { error: "케이스를 찾을 수 없습니다." };
  }

  // 상태 업데이트
  const { error } = await adminSupabase
    .from("cases")
    .update({
      status: "CANCELED",
      end_date_final: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId);

  if (error) {
    console.error("강제 종료 에러:", error);
    return { error: "강제 종료에 실패했습니다." };
  }

  // 활동 로그 기록
  await logActivity(caseId, ACTIVITY_ACTIONS.FORCE_END, {
    before_status: currentCase.status,
    after_status: "CANCELED",
    reason,
    ended_at: new Date().toISOString(),
  });

  revalidatePath("/admin/cases");
  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath(`/cases/${caseId}`);
  
  return { success: true };
}

// ================================================
// 케이스 삭제 (Admin만 가능)
// ================================================
export async function adminDeleteCase(caseId: string, reason: string) {
  await checkAdminPermission();
  const adminSupabase = createAdminClient();

  if (!reason || reason.trim().length < 5) {
    return { error: "삭제 사유를 5자 이상 입력해주세요." };
  }

  // 케이스 정보 조회 (로그 기록용)
  const { data: caseData } = await adminSupabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  if (!caseData) {
    return { error: "케이스를 찾을 수 없습니다." };
  }

  // 삭제 전 활동 로그 기록
  await logActivity(caseId, ACTIVITY_ACTIONS.DELETE_CASE, {
    case_info: {
      patient_name: caseData.patient_name,
      hospital_name: caseData.hospital_name,
      start_date: caseData.start_date,
      end_date: caseData.end_date_final || caseData.end_date_expected,
      status: caseData.status,
    },
    reason,
    deleted_at: new Date().toISOString(),
  });

  // 케이스 삭제 (CASCADE로 연관 데이터 자동 삭제)
  const { error } = await adminSupabase
    .from("cases")
    .delete()
    .eq("id", caseId);

  if (error) {
    console.error("케이스 삭제 에러:", error);
    return { error: "케이스 삭제에 실패했습니다." };
  }

  revalidatePath("/admin/cases");
  
  return { success: true };
}

// ================================================
// Admin 계정으로 승격 (개발/테스트용)
// ================================================
export async function promoteToAdmin(userId: string) {
  const user = await checkAdminPermission();
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("users")
    .update({ role: 'admin' })
    .eq("id", userId);

  if (error) {
    console.error("Admin 승격 에러:", error);
    return { error: "Admin 승격에 실패했습니다." };
  }

  await logActivity(userId, null as any, "PROMOTE_TO_ADMIN", {
    promoted_by: user.id,
    promoted_at: new Date().toISOString(),
  });

  return { success: true };
}

