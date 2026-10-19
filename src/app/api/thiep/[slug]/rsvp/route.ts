import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson } from "@/lib/cards/http";
import { addRsvp, guestByCode, type RsvpStatus } from "@/lib/invites/guests";
import { inviteIdBySlug } from "@/lib/invites/server";

// Guests confirm attendance (from their personal link ?k=<code>, or the general link).
export async function POST(request: Request, ctx: RouteContext<"/api/thiep/[slug]/rsvp">) {
  const { slug } = await ctx.params;
  const b = await readJson(request);
  if (!b) return fail("Dữ liệu không hợp lệ.");
  if (typeof b.website === "string" && b.website) return ok({ ok: true });
  const ip = clientIp(request.headers);
  if (!rateLimit(`rsvp:${slug}:${ip}`, 10, 10 * 60_000).ok) return fail("Bạn gửi hơi nhanh, vui lòng thử lại sau ít phút.", 429);

  const invite = await inviteIdBySlug(slug);
  if (!invite || !invite.rsvp.enabled) return fail("Thiệp không nhận xác nhận tham dự.", 404);
  const guest = typeof b.code === "string" && b.code ? await guestByCode(invite.id, b.code) : undefined;

  const status = ["yes", "no", "maybe"].includes(String(b.status)) ? (b.status as RsvpStatus) : null;
  if (!status) return fail("Hãy chọn bạn có đến được không.");
  const name = (guest?.name ?? String(b.name ?? "")).normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 80);
  if (name.length < 2) return fail("Vui lòng nhập tên của bạn.");
  const cap = guest?.maxPeople ?? invite.rsvp.limit ?? 20;
  const people = Math.min(cap, Math.max(1, Number.parseInt(String(b.people ?? 1), 10) || 1));

  const answers: Record<string, string> = {};
  const given = (b.answers ?? {}) as Record<string, unknown>;
  for (const q of invite.rsvp.questions) {
    const v = typeof given[q.id] === "string" ? (given[q.id] as string).trim().slice(0, 200) : "";
    if (!v) continue;
    if (q.type === "choice" && !q.options.includes(v)) continue;
    answers[q.label] = v;
  }
  try {
    await addRsvp(invite.id, { guestId: guest?.id ?? null, name, status, people, answers, ip });
    return ok({ ok: true });
  } catch (e) {
    console.error("[rsvp] failed:", (e as Error).message);
    return fail("Hệ thống đang bận, vui lòng thử lại.", 500);
  }
}
