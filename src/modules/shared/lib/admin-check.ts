"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";

/**
 * 현재 사용자가 어드민인지 확인
 * @returns {Promise<boolean>} 어드민 여부
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  // adminSupabase 사용 (RLS 우회)
  const { data: userData } = await adminSupabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return userData?.role === 'admin';
}

