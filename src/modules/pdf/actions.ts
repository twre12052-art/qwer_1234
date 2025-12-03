"use server";

import { createClient } from "@/modules/shared/lib/supabase/server";
import { redirect } from "next/navigation";
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { CasePdfDocument } from "./components/CasePdfDocument";

// Note: Server Actions cannot return a stream directly to the client in a way that triggers download easily 
// without using a Route Handler. Server Actions are for data mutation mostly.
// To download a file, we usually use a Route Handler (GET request).
// So I will create a Route Handler `src/app/api/pdf/[caseId]/route.ts` instead of a pure server action for the download.
// But I can use a server action to VALIDATE and then return a success flag or URL.
// Actually, the user wants a button "Generate PDF". 
// I'll implement a Route Handler for the actual generation and download.
// The server action `checkPdfRequirements` can be used by UI to enable/disable the button or show warnings.

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

    // 3. Check Logs
    const { count: logCount } = await supabase
        .from("care_logs")
        .select("*", { count: 'exact', head: true })
        .eq("case_id", caseId)
        .eq("is_active", true);
    
    if (!logCount || logCount === 0) errors.push("작성된 간병일지가 없습니다.");

    // 4. Check Payment
    const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("case_id", caseId)
        .single();
    
    if (!payment) errors.push("지급 정보가 입력되지 않았습니다.");

    if (errors.length > 0) {
        return { missingRequirements: errors };
    }

    return { success: true };
}

