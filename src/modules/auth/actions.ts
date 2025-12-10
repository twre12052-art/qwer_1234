"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { sendSMS, generateOtpCode, createOtpMessage } from "@/modules/shared/lib/solapi";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type {
  SendOtpResponse,
  VerifyOtpResponse,
  RateLimitCheckResult,
} from "@/modules/shared/types/auth";

// ================================================
// 아이디 중복확인
// ================================================
export async function checkUsernameAvailable(
  username: string
): Promise<{ available: boolean; message: string }> {
  const adminSupabase = createAdminClient();

  try {
    const { data, error } = await adminSupabase
      .from('users')
      .select('id')
      .eq('name', username) // name 컬럼을 username으로 사용
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Username check error:', error);
      return {
        available: false,
        message: '중복확인에 실패했습니다. 다시 시도해주세요.',
      };
    }

    if (data) {
      return {
        available: false,
        message: '이미 사용 중인 아이디입니다.',
      };
    }

    return {
      available: true,
      message: '사용 가능한 아이디입니다.',
    };
  } catch (error: any) {
    console.error('Username check error:', error);
    return {
      available: false,
      message: '중복확인에 실패했습니다. 다시 시도해주세요.',
    };
  }
}

// ================================================
// 아이디/비밀번호 기반 로그인
// ================================================
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; message?: string; redirectTo?: string }> {
  const supabase = createClient();
  const adminSupabase = createAdminClient();

  try {
    // 1. 아이디로 사용자 찾기 (role도 함께 조회)
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('auth_email, role')
      .eq('name', username) // name을 username으로 사용
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      };
    }

    // 2. auth_email로 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.auth_email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: '로그인에 실패했습니다.',
      };
    }

    // 3. role에 따라 리다이렉트 경로 결정
    const redirectTo = userData.role === 'admin' ? '/admin/cases' : '/cases';
    
    revalidatePath("/cases");
    revalidatePath("/admin/cases");
    
    return { 
      success: true,
      redirectTo
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: '로그인에 실패했습니다. 다시 시도해주세요.',
    };
  }
}

// ================================================
// 아이디/비밀번호 기반 회원가입
// ================================================
export async function signup(data: {
  username: string; // 아이디 (이메일 아님)
  password: string;
  fullName: string; // 실명
  birthDate: string; // YYMMDD-X 형식
  contactEmail?: string;
  phone: string;
  otpId: string;
}): Promise<{ success: boolean; message?: string }> {
  const supabase = createClient();
  const adminSupabase = createAdminClient();

  try {
    // 1. OTP 검증
    const { data: otp, error: otpError } = await adminSupabase
      .from('phone_otps')
      .select('*')
      .eq('id', data.otpId)
      .eq('phone', data.phone)
      .eq('used', false)
      .single();

    if (otpError || !otp) {
      return {
        success: false,
        message: '인증 정보가 유효하지 않습니다. 다시 인증해주세요.',
      };
    }

    // 만료 확인
    if (new Date(otp.expires_at) < new Date()) {
      return {
        success: false,
        message: '인증이 만료되었습니다. 다시 인증해주세요.',
      };
    }

    // 2. 아이디 중복 확인 (아이디만 체크)
    const { data: existingUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('name', data.username)
      .single();

    if (existingUser) {
      return {
        success: false,
        message: '이미 사용 중인 아이디입니다.',
      };
    }

    // 3. 전화번호 중복 체크 제거
    // 같은 전화번호로 여러 계정 생성 가능
    // (테스트 및 사용자 편의성을 위해)

    // 4. auth_email 생성 (username@care.local 형식)
    const authEmail = `${data.username}@care.local`;

    // 5. Supabase Auth 유저 생성
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: authEmail,
      password: data.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('Auth 유저 생성 에러:', authError);
      return {
        success: false,
        message: '회원가입에 실패했습니다. 다시 시도해주세요.',
      };
    }

    // 6. 생년월일 파싱 (YYMMDD-X → YYYY-MM-DD)
    let birthDateFormatted: string | null = null;
    if (data.birthDate && data.birthDate.length === 8) {
      const yy = data.birthDate.substring(0, 2);
      const mm = data.birthDate.substring(2, 4);
      const dd = data.birthDate.substring(4, 6);
      const genderDigit = data.birthDate.substring(7, 8);
      
      // 1,2: 1900년대, 3,4: 2000년대
      const yyyy = (genderDigit === '1' || genderDigit === '2') 
        ? `19${yy}` 
        : `20${yy}`;
      
      birthDateFormatted = `${yyyy}-${mm}-${dd}`;
    }

    // 7. users 테이블에 정보 저장 (upsert로 변경 - 중복 방지)
    const { error: userError } = await adminSupabase
      .from('users')
      .upsert({
        id: authData.user.id,
        auth_email: authEmail,
        name: data.username, // name을 username으로 사용
        full_name: data.fullName, // 실명
        birth_date: birthDateFormatted,
        contact_email: data.contactEmail || null,
        phone: data.phone,
        phone_verified_at: new Date().toISOString(),
        role: 'guardian',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('users 테이블 저장 에러:', userError);
      // Auth 유저는 생성되었지만 users 테이블 저장 실패 시 롤백
      try {
        await adminSupabase.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Auth 유저 삭제 에러:', deleteError);
      }
      return {
        success: false,
        message: '회원가입에 실패했습니다. 다시 시도해주세요.',
      };
    }

    // 8. OTP 사용 처리
    await adminSupabase
      .from('phone_otps')
      .update({ used: true })
      .eq('id', data.otpId);

    revalidatePath("/login");
    return {
      success: true,
      message: '회원가입이 완료되었습니다.',
    };
  } catch (error: any) {
    console.error('회원가입 에러:', error);
    return {
      success: false,
      message: '회원가입에 실패했습니다. 다시 시도해주세요.',
    };
  }
}

// ================================================
// 상수 정의
// ================================================
const OTP_EXPIRY_MINUTES = 5; // 인증번호 유효 시간
const OTP_MAX_ATTEMPTS = 5; // 최대 시도 횟수
const RATE_LIMIT_MINUTE = 60; // 1분 (초 단위)
const RATE_LIMIT_DAY_MAX = 10; // 하루 최대 발송 횟수
const RATE_LIMIT_DAY = 24 * 60 * 60; // 24시간 (초 단위)

// ================================================
// 헬퍼 함수: 해시 생성 (간단한 SHA-256)
// ================================================
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ================================================
// RateLimit 체크
// ================================================
async function checkRateLimit(phone: string): Promise<RateLimitCheckResult> {
  // Service Role Key를 사용해야 rate_limits 테이블 접근 가능
  const serviceSupabase = createAdminClient();

  const { data: rateLimit } = await serviceSupabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', phone)
    .eq('limit_type', 'sms_send')
    .single();

  if (!rateLimit) {
    // 첫 요청
    return { allowed: true };
  }

  const now = new Date();
  const lastAttempt = new Date(rateLimit.last_attempt_at);
  const firstAttempt = new Date(rateLimit.first_attempt_at);

  // 1분 내 재요청 차단
  const secondsSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / 1000;
  if (secondsSinceLastAttempt < RATE_LIMIT_MINUTE) {
    return {
      allowed: false,
      reason: '요청이 너무 잦습니다. 1분 후 다시 시도해주세요.',
      retryAfter: Math.ceil(RATE_LIMIT_MINUTE - secondsSinceLastAttempt),
    };
  }

  // 24시간 내 10회 초과 차단
  const secondsSinceFirstAttempt = (now.getTime() - firstAttempt.getTime()) / 1000;
  if (secondsSinceFirstAttempt < RATE_LIMIT_DAY && rateLimit.attempt_count >= RATE_LIMIT_DAY_MAX) {
    return {
      allowed: false,
      reason: '오늘 최대 요청 횟수를 초과했습니다. 내일 다시 시도해주세요.',
      retryAfter: Math.ceil(RATE_LIMIT_DAY - secondsSinceFirstAttempt),
    };
  }

  // 24시간이 지났으면 카운터 리셋
  if (secondsSinceFirstAttempt >= RATE_LIMIT_DAY) {
    await serviceSupabase
      .from('rate_limits')
      .update({
        attempt_count: 0,
        first_attempt_at: now.toISOString(),
      })
      .eq('identifier', phone)
      .eq('limit_type', 'sms_send');
  }

  return { allowed: true };
}

// ================================================
// RateLimit 기록 업데이트
// ================================================
async function updateRateLimit(phone: string): Promise<void> {
  const serviceSupabase = createAdminClient();

  const { data: existing } = await serviceSupabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', phone)
    .eq('limit_type', 'sms_send')
    .single();

  const now = new Date().toISOString();

  if (existing) {
    await serviceSupabase
      .from('rate_limits')
      .update({
        attempt_count: existing.attempt_count + 1,
        last_attempt_at: now,
      })
      .eq('identifier', phone)
      .eq('limit_type', 'sms_send');
  } else {
    await serviceSupabase
      .from('rate_limits')
      .insert({
        identifier: phone,
        limit_type: 'sms_send',
        attempt_count: 1,
        last_attempt_at: now,
        first_attempt_at: now,
      });
  }
}

// ================================================
// 인증번호 발송
// ================================================
export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  try {
    // 전화번호 검증
    const phoneRegex = /^01[0-9]{8,9}$/;
    if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
      return {
        success: false,
        message: '올바른 휴대폰 번호 형식이 아닙니다.',
      };
    }

    // RateLimit 체크
    const rateLimitCheck = await checkRateLimit(phone);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: rateLimitCheck.reason || '요청이 제한되었습니다.',
      };
    }

    // 인증번호 생성
    const code = generateOtpCode();
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // DB에 저장 (Service Role Key 필요)
    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase
      .from('phone_otps')
      .insert({
        phone,
        code_hash: codeHash,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('OTP 저장 에러:', insertError);
      return {
        success: false,
        message: '인증번호 생성에 실패했습니다.',
      };
    }

    // SMS 발송
    const message = createOtpMessage(code);
    const smsResult = await sendSMS({ to: phone, message });

    if (!smsResult.success) {
      return {
        success: false,
        message: smsResult.error || 'SMS 발송에 실패했습니다.',
      };
    }

    // RateLimit 업데이트
    await updateRateLimit(phone);

    return {
      success: true,
      message: '인증번호가 발송되었습니다.',
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    };
  } catch (error: any) {
    console.error('sendOtp 에러:', error);
    return {
      success: false,
      message: '서버 오류가 발생했습니다.',
    };
  }
}

// ================================================
// 인증번호 확인 (첫 번째 단계 - OTP만 검증)
// ================================================
export async function verifyOtpOnly(
  phone: string,
  code: string
): Promise<VerifyOtpResponse> {
  try {
    const adminSupabase = createAdminClient();
    const codeHash = await hashCode(code);

    // OTP 조회
    const { data: otps, error: otpError } = await adminSupabase
      .from('phone_otps')
      .select('*')
      .eq('phone', phone)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError || !otps || otps.length === 0) {
      return {
        success: false,
        message: '유효한 인증번호가 없습니다.',
      };
    }

    const otp = otps[0];

    // 만료 확인
    if (new Date(otp.expires_at) < new Date()) {
      return {
        success: false,
        message: '인증번호가 만료되었습니다. 새로운 인증번호를 요청해주세요.',
      };
    }

    // 시도 횟수 확인
    if (otp.attempt_count >= OTP_MAX_ATTEMPTS) {
      return {
        success: false,
        message: '최대 시도 횟수를 초과했습니다. 새로운 인증번호를 요청해주세요.',
      };
    }

    // 코드 검증
    if (otp.code_hash !== codeHash) {
      // 시도 횟수 증가
      await adminSupabase
        .from('phone_otps')
        .update({ attempt_count: otp.attempt_count + 1 })
        .eq('id', otp.id);

      return {
        success: false,
        message: '인증번호가 일치하지 않습니다.',
      };
    }

    // 신규 사용자 여부 확인 (회원가입 화면용)
    const { data: existingUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    // OTP ID 반환 (아직 사용 처리 안 함 - signup 함수에서 처리)
    return {
      success: true,
      message: '인증이 완료되었습니다.',
      isNewUser: !existingUser, // 기존 사용자 있으면 false
      otpId: otp.id,
    };
  } catch (error: any) {
    console.error('verifyOtpOnly 에러:', error);
    return {
      success: false,
      message: '서버 오류가 발생했습니다.',
    };
  }
}

// ================================================
// 회원가입 완료 (두 번째 단계 - 실제 회원 생성)
// ================================================
export async function completeSignup(
  phone: string,
  otpId: string,
  userData: { name: string; birth_date?: string; contact_email?: string }
): Promise<VerifyOtpResponse> {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    // OTP 확인 (ID로 직접 조회)
    const { data: otp, error: otpError } = await adminSupabase
      .from('phone_otps')
      .select('*')
      .eq('id', otpId)
      .eq('phone', phone)
      .eq('used', false)
      .single();

    if (otpError || !otp) {
      return {
        success: false,
        message: '인증 정보가 유효하지 않습니다. 다시 인증해주세요.',
      };
    }

    // 만료 확인
    if (new Date(otp.expires_at) < new Date()) {
      return {
        success: false,
        message: '인증이 만료되었습니다. 다시 인증해주세요.',
      };
    }

    const authEmail = `${phone}@care.local`;

    // 1. Supabase Auth 유저 생성
    const userPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: authEmail,
      password: userPassword,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('Auth 유저 생성 에러:', authError);
      return {
        success: false,
        message: '계정 생성에 실패했습니다. 다시 시도해주세요.',
      };
    }

    const userId = authData.user.id;

    // 2. users 테이블에 데이터 삽입
    const { data: newUser, error: createError } = await adminSupabase
      .from('users')
      .insert({
        id: userId,
        auth_email: authEmail,
        phone,
        name: userData.name,
        birth_date: userData.birth_date || null,
        contact_email: userData.contact_email || null,
        phone_verified_at: new Date().toISOString(),
        role: 'guardian',
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('사용자 생성 에러:', createError);
      // Auth 유저 삭제 (정리)
      await adminSupabase.auth.admin.deleteUser(userId);
      return {
        success: false,
        message: '사용자 생성에 실패했습니다.',
      };
    }

    // 3. OTP 사용 처리
    await adminSupabase
      .from('phone_otps')
      .update({ used: true })
      .eq('id', otpId);

    // 회원가입 완료 - 자동 로그인하지 않고 로그인 화면으로 안내
    return {
      success: true,
      message: '회원가입이 완료되었습니다. 로그인해주세요.',
      isNewUser: true,
      redirectTo: '/auth/phone', // 로그인 화면으로
    };
  } catch (error: any) {
    console.error('completeSignup 에러:', error);
    return {
      success: false,
      message: '서버 오류가 발생했습니다.',
    };
  }
}

// ================================================
// 로그아웃
// ================================================
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  return { success: true, redirectTo: '/' };
}

// ================================================
// 현재 사용자 정보 조회
// ================================================
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('auth_email', user.email)
    .single();

  return userData;
}

// ================================================
// 프로필 업데이트
// ================================================
export async function updateProfile(updates: {
  name?: string;
  birth_date?: string;
  contact_email?: string;
}) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('auth_email', user.email);

    if (error) {
      console.error('프로필 업데이트 에러:', error);
      return { success: false, message: '프로필 업데이트에 실패했습니다.' };
    }

    revalidatePath('/profile');
    return { success: true, message: '프로필이 업데이트되었습니다.' };
  } catch (error: any) {
    console.error('updateProfile 에러:', error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}
