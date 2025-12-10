// ================================================
// Solapi SMS 발송 유틸리티
// ================================================

interface SolapiSendOptions {
  to: string;
  message: string;
}

/**
 * Solapi를 통해 SMS 발송
 * 
 * @param options - 발송 옵션
 * @returns 발송 결과
 */
export async function sendSMS(options: SolapiSendOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const senderPhone = process.env.SOLAPI_SENDER_PHONE;

  // 개발 모드: 실제 발송하지 않고 콘솔에만 출력
  if (isDevelopment || !apiKey || !apiSecret) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 [개발 모드] SMS 발송 시뮬레이션');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`수신자: ${options.to}`);
    console.log(`내용: ${options.message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return {
      success: true,
      messageId: `dev-${Date.now()}`,
    };
  }

  // 운영 모드: 실제 Solapi API 호출
  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        message: {
          to: options.to.replace(/[^0-9]/g, ''), // 숫자만 추출
          from: senderPhone,
          text: options.message,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Solapi API 에러:', errorData);
      
      return {
        success: false,
        error: errorData.message || 'SMS 발송에 실패했습니다.',
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      messageId: data.messageId,
    };
    
  } catch (error: any) {
    console.error('Solapi 발송 에러:', error);
    
    return {
      success: false,
      error: error.message || '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 6자리 인증번호 생성
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 인증번호 SMS 메시지 생성
 */
export function createOtpMessage(code: string): string {
  return `[간병노트] 인증번호는 [${code}]입니다. 5분 내에 입력해주세요.`;
}

