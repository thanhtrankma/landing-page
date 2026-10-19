import "server-only";
import { fail } from "../cards/http";
import { requestRole, type Role } from "./access";

// Request helpers for /api/invites routes.

export const inviteCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 400,
};

/** Resolves the caller's role, or returns the 403 response to send. */
export async function guard(request: Request, id: string, allowed: Role[] = ["owner", "editor", "token"]) {
  const { role, user } = await requestRole(request, id);
  if (!role || !allowed.includes(role)) return { denied: fail("Bạn không có quyền với thiệp này.", 403) } as const;
  return { role, user } as const;
}
