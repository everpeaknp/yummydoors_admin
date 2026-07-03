import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE } from "@/lib/config";

export async function POST() {
  const response = NextResponse.redirect(new URL("/login", "http://localhost"));
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(USER_COOKIE);
  return response;
}
