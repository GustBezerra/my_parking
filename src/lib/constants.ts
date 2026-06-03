export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-prod";
export const JWT_EXPIRES_IN = "7d";
export const COOKIE_NAME = "auth_token";
