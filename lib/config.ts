export function getBackendUrl(): string {
  return (
    process.env.YUMMYDOORS_ADMIN_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000"
  );
}

export const ACCESS_COOKIE = "yd_admin_access_token";
export const REFRESH_COOKIE = "yd_admin_refresh_token";
export const USER_COOKIE = "yd_admin_user_name";
