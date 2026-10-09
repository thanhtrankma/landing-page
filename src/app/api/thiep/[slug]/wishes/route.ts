import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson } from "@/lib/cards/http";
import { addWish, inviteIdBySlug } from "@/lib/invites/server";

// Guests leave a wish / RSVP on a shared invitation. Public, so: honeypot, rate limit, length caps.
export async function POST(request: Request, ctx: RouteContext<"/api/thiep/[slug]/wishes">) {
  const { slug } = await ctx.params;
  const body = await readJson(request);
  if (!body) return fail("Dữ liệu không hợp lệ.");
  if (typeof body.website === "string" && body.website) return ok({ wish: null });

  const name = String(body.name ?? "").normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 60);
  const message = String(body.message ?? "").normalize("NFC").trim().slice(0, 500);
  const attend = ["yes", "no", "maybe"].includes(String(body.attend)) ? (body.attend as "yes" | "no" | "maybe") : null;
  const guests = attend === "yes" ? Math.min(10, Math.max(1, Number.parseInt(String(body.guests ?? 1), 10) || 1)) : 0;
  if (name.length < 2) return fail("Vui lòng nhập tên của bạn.");
  if (!message && !attend) return fail("Hãy viết lời chúc hoặc chọn xác nhận tham dự.");

  const ip = clientIp(request.headers);
  const limit = rateLimit(`wish:${slug}:${ip}`, 5, 10 * 60_000);
  if (!limit.ok) return fail("Bạn gửi hơi nhanh, vui lòng thử lại sau ít phút.", 429);

  const invite = await inviteIdBySlug(slug);
  if (!invite || !invite.rsvp) return fail("Thiệp không nhận lời chúc.", 404);
  try {
    const wish = await addWish(invite.id, { name, message, attend, guests, ip });
    return ok({ wish: wish.message ? { id: wish.id, name: wish.name, message: wish.message, createdAt: wish.createdAt } : null });
  } catch (e) {
    console.error("[invites] wish failed:", (e as Error).message);
    return fail("Hệ thống đang bận, vui lòng thử lại.", 500);
  }
}
