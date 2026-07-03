import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE, getBackendUrl } from "@/lib/config";
import type { ApiResponse, UserSummary } from "@/lib/types";

type LoginResponse = ApiResponse<{
  tokens: {
    access_token: string;
    refresh_token: string;
  };
  user: UserSummary;
}>;

function isLoginResponse(
  payload: LoginResponse | { detail?: string } | null,
): payload is LoginResponse {
  return Boolean(payload && typeof payload === "object" && "data" in payload);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendResponse = await fetch(`${getBackendUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const payload = (await backendResponse.json().catch(() => null)) as LoginResponse | { detail?: string } | null;

  if (!backendResponse.ok) {
    return NextResponse.json(
      { detail: payload && "detail" in payload ? payload.detail : "Login failed." },
      { status: backendResponse.status }
    );
  }

  if (!isLoginResponse(payload)) {
    return NextResponse.json({ detail: "Login response was invalid." }, { status: 502 });
  }

  const user = payload.data.user;
  const isSuperAdmin = user?.roles.some((role) => role.code === "super_admin");
  if (!isSuperAdmin || !payload.data.tokens.access_token || !payload.data.tokens.refresh_token) {
    return NextResponse.json(
      { detail: "This account does not have super-admin access." },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE, payload.data.tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
  response.cookies.set(REFRESH_COOKIE, payload.data.tokens.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
  response.cookies.set(USER_COOKIE, payload.data.user.full_name, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
  return response;
}
