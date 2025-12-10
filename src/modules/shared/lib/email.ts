// ================================================
// 이메일 발송 유틸 (Nodemailer + Gmail SMTP)
// ================================================

import nodemailer from 'nodemailer';

// Gmail SMTP 설정
function createEmailTransporter() {
  // 환경 변수 확인
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.warn('⚠️ Gmail 환경 변수가 설정되지 않았습니다.');
    console.warn('GMAIL_USER와 GMAIL_APP_PASSWORD를 .env.local에 추가하세요.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

// ================================================
// PDF 파일을 이메일로 발송
// ================================================
export async function sendPdfEmail(
  to: string,
  pdfBuffer: Buffer,
  caseInfo: {
    patientName: string;
    startDate: string;
    endDate: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createEmailTransporter();
    
    if (!transporter) {
      return {
        success: false,
        error: 'Gmail 설정이 필요합니다. 관리자에게 문의하세요.',
      };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return {
        success: false,
        error: '올바른 이메일 주소를 입력해주세요.',
      };
    }

    const mailOptions = {
      from: `간병노트 <${process.env.GMAIL_USER}>`,
      to,
      subject: `[간병노트] ${caseInfo.patientName}님 간병 서류`,
      html: `
        <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📋 간병 서류가 도착했습니다</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">간병 정보</h3>
            <p><strong>환자:</strong> ${caseInfo.patientName}</p>
            <p><strong>기간:</strong> ${caseInfo.startDate} ~ ${caseInfo.endDate}</p>
          </div>
          
          <p>첨부된 PDF 파일을 확인하시고, 보험사 또는 회사에 제출하시면 됩니다.</p>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ 주의사항</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">
              이 서류는 보험 청구용이며, 연말정산 의료비 공제용 영수증이 아닙니다.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            문의사항이 있으시면 언제든지 연락주세요.<br>
            감사합니다.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            간병노트 | 가족 간병 서류 관리 서비스
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `간병서류_${caseInfo.patientName}_${caseInfo.startDate}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error: any) {
    console.error('이메일 발송 에러:', error);
    return {
      success: false,
      error: error.message || '이메일 발송에 실패했습니다.',
    };
  }
}

