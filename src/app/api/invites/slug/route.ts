import { fail, ok } from "@/lib/cards/http";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { slugProblem, slugTaken } from "@/lib/invites/server";

// Live availability check while the couple types their link.
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const slug = String(q.get("slug") ?? "").trim().toLowerCase();
  if (!rateLimit(`invite:slug:${clientIp(request.headers)}`, 120, 60_000).ok) return fail("Thử lại sau ít giây.", 429);
  const problem = slugProblem(slug);
  if (problem) return ok({ available: false, reason: problem });
  try {
    const taken = await slugTaken(slug, q.get("id") ?? undefined);
    return ok({ available: !taken, reason: taken ? "Đường dẫn này đã có người dùng." : null });
  } catch {
    return ok({ available: true, reason: null });
  }
}
