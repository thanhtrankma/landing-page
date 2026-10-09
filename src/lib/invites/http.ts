import "server-only";
import { INVITE_COOKIE, inviteTokenMatches } from "./server";

// Owner access for /api/invites routes: the httpOnly cookie set at creation/claim, or an explicit header.
function cookieValue(request: Request, name: string) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

export function canEditInvite(request: Request, id: string) {
  return inviteTokenMatches(id, request.headers.get("x-edit-token") ?? cookieValue(request, INVITE_COOKIE(id)));
}

export const inviteCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 400,
};
