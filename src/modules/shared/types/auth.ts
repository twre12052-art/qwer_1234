// ================================================
// M1: 인증 관련 타입 정의
// ================================================

export interface User {
  id: string;
  auth_email: string;
  name: string;
  birth_date: string | null;
  contact_email: string | null;
  phone: string;
  phone_verified_at: string | null;
  role: 'guardian' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface PhoneOtp {
  id: string;
  phone: string;
  code_hash: string;
  expires_at: string;
  attempt_count: number;
  used: boolean;
  created_at: string;
}

export interface RateLimit {
  id: string;
  identifier: string;
  limit_type: 'sms_send' | 'api_call';
  attempt_count: number;
  last_attempt_at: string;
  first_attempt_at: string;
  created_at: string;
}

// 휴대폰 인증 요청
export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // 초 단위
}

// 인증 확인 요청
export interface VerifyOtpRequest {
  phone: string;
  code: string;
  name?: string; // 신규 가입 시 필요
  birth_date?: string;
  contact_email?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  redirectTo?: string;
  otpId?: string; // OTP ID (신규 사용자 확인 시)
}

// 프로필 업데이트
export interface UpdateProfileRequest {
  name?: string;
  birth_date?: string;
  contact_email?: string;
}

// RateLimit 체크 결과
export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // 초 단위
}

