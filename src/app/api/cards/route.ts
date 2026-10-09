import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin, withEditCookie } from "@/lib/cards/http";
import { createDesign, sanitizeCanvas, validSize } from "@/lib/cards/server";

// Creates a design. The response carries the edit token once (and sets it as an httpOnly cookie).
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const body = await readJson(request);
  if (!body) return fail("Dữ liệu không hợp lệ.");
  if (!validSize(body.width, body.height)) return fail("Kích thước thiệp không hợp lệ.");
  const canvas = sanitizeCanvas(body.canvas);
  if (!canvas.ok) return fail(canvas.error);

  const ip = clientIp(request.headers);
  const limit = rateLimit(`card:create:${ip}`, 20, 60 * 60_000);
  if (!limit.ok) return fail("Bạn tạo quá nhiều thiệp, vui lòng thử lại sau.", 429);

  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 120) : "Thiệp cưới";
  const templateSlug = typeof body.templateSlug === "string" ? body.templateSlug.slice(0, 120) : null;
  try {
    const { id, token } = await createDesign({ title, templateSlug, width: body.width as number, height: body.height as number, canvas: canvas.json, ip });
    return withEditCookie(ok({ id, token }), id, token);
  } catch (e) {
    console.error("[cards] create failed:", (e as Error).message);
    return fail("Hệ thống đang bận, vui lòng thử lại.", 500);
  }
}
