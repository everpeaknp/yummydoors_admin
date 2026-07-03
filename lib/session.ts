import { cookies } from "next/headers";

import { ACCESS_COOKIE, USER_COOKIE } from "@/lib/config";

export function getAccessToken(): string | undefined {
  return cookies().get(ACCESS_COOKIE)?.value;
}

export function getUserName(): string {
  return cookies().get(USER_COOKIE)?.value ?? "Super Admin";
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
