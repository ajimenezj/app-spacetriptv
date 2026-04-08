import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/login?error=Please enter email and password", request.url)
    );
  }

  const result = await authenticateUser(email, password);

  if (!result.success || !result.user) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(result.error || "Login failed")}`,
        request.url
      )
    );
  }

  const isAdmin = result.user.user_email.toLowerCase() === 'ajimenezj@gmail.com'

  const sessionData = JSON.stringify({
    user_id: result.user.user_id,
    user_email: result.user.user_email,
    is_admin: isAdmin,
  });

  const response = NextResponse.redirect(
    new URL("/dashboard", request.url)
  );

  // httpOnly: false so client components can read user_email for display
  response.cookies.set("session", sessionData, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 2 weeks
  });

  return response;
}
