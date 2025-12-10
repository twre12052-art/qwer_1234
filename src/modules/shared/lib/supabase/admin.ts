// ================================================
// Supabase Admin Client (Service Role Key 사용)
// ================================================
// 주의: 이 클라이언트는 서버에서만 사용해야 합니다!
// Service Role Key는 RLS를 우회하므로 매우 신중하게 사용해야 합니다.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let adminClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
  }

  adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

