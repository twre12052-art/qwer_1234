"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/modules/shared/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  revalidatePath("/", "layout");
  redirect("/cases");
}

export async function signup(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
       return { error: "이미 가입된 이메일입니다." };
    }
    return { error: error.message };
  }

  // If email confirmation is disabled or not required, session will be present immediately.
  if (data.session) {
      revalidatePath("/", "layout");
      redirect("/cases");
  } 

  // If session is null, it means email confirmation is required.
  return { message: "가입 성공! 이메일로 발송된 확인 링크를 클릭해주세요." };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
