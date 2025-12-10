import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public paths (인증 불필요)
  const publicPaths = ['/auth', '/debug', '/caregiver', '/privacy', '/login', '/signup', '/terms', '/'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Protected paths (인증 필요)
  const protectedPaths = ['/cases', '/profile', '/admin'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // 인증이 필요한 경로에 미인증 사용자 접근 시
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시
  if ((pathname === "/login" || pathname === "/signup" || pathname.startsWith("/auth/phone")) && user) {
    // Admin인지 확인
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: userData } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const redirectPath = userData?.role === 'admin' ? '/admin/cases' : '/cases';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // /admin 경로는 admin 역할만 접근 가능
  if (pathname.startsWith("/admin")) {
    if (!user) {
      // 미인증 사용자는 로그인 페이지로
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // adminSupabase 사용 (RLS 우회)
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('🔍 Admin 권한 체크:', {
      user_id: user.id,
      user_email: user.email,
      userData,
      userError,
    });

    if (!userData || userData.role !== 'admin') {
      console.log('❌ Admin 권한 없음 → /cases로 리다이렉트');
      // admin이 아니면 /cases로 리다이렉트
      return NextResponse.redirect(new URL("/cases", request.url));
    }

    console.log('✅ Admin 권한 확인됨!');
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

