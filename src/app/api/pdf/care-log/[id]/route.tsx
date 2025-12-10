import { NextRequest, NextResponse } from "next/server";
import { Document, pdf, Font } from "@react-pdf/renderer";
import { createClient } from "@/modules/shared/lib/supabase/server";
import { createAdminClient } from "@/modules/shared/lib/supabase/admin";
import { CareLogsPdf } from "@/modules/pdf/templates/care-logs-pdf";
import path from "path";

// 한글 폰트 등록
Font.register({
  family: "NanumGothic",
  src: path.join(process.cwd(), "public", "fonts", "NanumGothic-Regular.ttf"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const caseId = params.id;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // 특정 날짜의 일지만 다운로드

  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 케이스 조회
    const { data: caseData, error: caseError } = await adminSupabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // 권한 확인
    if (caseData.guardian_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 간병일지 조회
    let query = adminSupabase
      .from("care_logs")
      .select("*")
      .eq("case_id", caseId)
      .eq("is_active", true)
      .order("date", { ascending: true });

    if (date) {
      query = query.eq("date", date);
    }

    const { data: logs, error: logsError } = await query;

    if (logsError) {
      console.error("간병일지 조회 오류:", logsError);
      return NextResponse.json(
        { error: "Failed to fetch care logs" },
        { status: 500 }
      );
    }

    // 간병일지가 없으면 첨부된 PDF 파일 확인
    if (!logs || logs.length === 0) {
      // 첨부된 간병일지 PDF 파일 확인
      const { data: attachments } = await adminSupabase
        .from("attachments")
        .select("*")
        .eq("case_id", caseId)
        .eq("file_type", "CARE_LOG_PDF")
        .order("created_at", { ascending: false })
        .limit(1);

      if (attachments && attachments.length > 0) {
        // 첨부된 PDF 파일이 있으면 해당 파일을 가져와서 반환
        const attachment = attachments[0];
        const filePath = attachment.file_url.split("/").slice(-2).join("/");
        
        // Storage에서 파일 다운로드
        const { data: fileData, error: downloadError } = await adminSupabase.storage
          .from("attachments")
          .download(filePath);

        if (downloadError || !fileData) {
          console.error("첨부 파일 다운로드 오류:", downloadError);
          // 다운로드 실패 시 원본 URL로 리다이렉트
          return NextResponse.redirect(attachment.file_url);
        }

        // 파일을 ArrayBuffer로 변환
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${attachment.file_name}"`,
          },
        });
      }

      // 간병일지도 없고 첨부파일도 없으면 에러 반환
      return NextResponse.json(
        { error: "간병인이 작성한 간병일지가 없습니다." },
        { status: 404 }
      );
    }

    // 첨부된 PDF 파일 확인 (간병일지와 함께 표시하기 위해)
    const { data: attachments } = await adminSupabase
      .from("attachments")
      .select("*")
      .eq("case_id", caseId)
      .eq("file_type", "CARE_LOG_PDF")
      .order("created_at", { ascending: false });

    // PDF 생성 (간병일지가 있을 때만)
    try {
      // logs가 비어있거나 null인 경우 체크
      if (!logs || logs.length === 0) {
        // 간병일지가 없으면 첨부 파일만 확인
        if (attachments && attachments.length > 0) {
          const attachment = attachments[0];
          const filePath = attachment.file_url.split("/").slice(-2).join("/");
          
          const { data: fileData, error: downloadError } = await adminSupabase.storage
            .from("attachments")
            .download(filePath);

          if (downloadError || !fileData) {
            return NextResponse.redirect(attachment.file_url);
          }

          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="${attachment.file_name}"`,
            },
          });
        }
        throw new Error("간병일지가 없습니다.");
      }

      // logs 데이터 검증
      const validLogs = logs.filter(log => log && log.content && log.date);
      if (validLogs.length === 0) {
        // 유효한 간병일지가 없으면 첨부 파일 확인
        if (attachments && attachments.length > 0) {
          const attachment = attachments[0];
          const filePath = attachment.file_url.split("/").slice(-2).join("/");
          
          const { data: fileData, error: downloadError } = await adminSupabase.storage
            .from("attachments")
            .download(filePath);

          if (downloadError || !fileData) {
            return NextResponse.redirect(attachment.file_url);
          }

          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="${attachment.file_name}"`,
            },
          });
        }
        throw new Error("유효한 간병일지가 없습니다.");
      }

      // 간병일지 PDF 생성
      // 전체 파일 다운로드 API와 동일한 방식으로 Document로 감싸서 사용
      const pdfDoc = pdf(
        <Document>
          <CareLogsPdf
            patientName={caseData.patient_name || ""}
            caregiverName={caseData.caregiver_name || ""}
            logs={validLogs}
          />
        </Document>
      );

      const buffer = await pdfDoc.toBuffer();
      
      if (!buffer || buffer.length === 0) {
        throw new Error("PDF 버퍼 생성 실패");
      }

      // 한글 인코딩 문제 방지를 위해 영문 파일명 사용
      const filename = date
        ? `care_log_${date}.pdf`
        : `care_log_all_${new Date().toISOString().split("T")[0]}.pdf`;

      return new NextResponse(buffer as any, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
        },
      });
    } catch (pdfError: any) {
      console.error("간병일지 PDF 생성 에러:", pdfError);
      
      // PDF 생성 실패 시 첨부된 PDF 파일 확인
      const { data: attachments } = await adminSupabase
        .from("attachments")
        .select("*")
        .eq("case_id", caseId)
        .eq("file_type", "CARE_LOG_PDF")
        .order("created_at", { ascending: false })
        .limit(1);

      if (attachments && attachments.length > 0) {
        // 첨부된 PDF 파일이 있으면 해당 파일을 가져와서 반환
        const attachment = attachments[0];
        const filePath = attachment.file_url.split("/").slice(-2).join("/");
        
        try {
          // Storage에서 파일 다운로드
          const { data: fileData, error: downloadError } = await adminSupabase.storage
            .from("attachments")
            .download(filePath);

          if (downloadError || !fileData) {
            console.error("첨부 파일 다운로드 오류:", downloadError);
            // 다운로드 실패 시 원본 URL로 리다이렉트
            return NextResponse.redirect(attachment.file_url);
          }

          // 파일을 ArrayBuffer로 변환
          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="${attachment.file_name}"`,
            },
          });
        } catch (downloadErr) {
          console.error("첨부 파일 처리 오류:", downloadErr);
          // 에러 발생 시 원본 URL로 리다이렉트
          return NextResponse.redirect(attachment.file_url);
        }
      }

      return NextResponse.json(
        { error: "간병일지 PDF 생성에 실패했습니다.", details: pdfError?.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("간병일지 PDF API 에러:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error?.message },
      { status: 500 }
    );
  }
}

