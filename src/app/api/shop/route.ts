import { rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { userFromRequest } from "@/lib/account/server";
import { loadBook, saveBook } from "@/lib/shop/server";
import { LIMITS, sanitizeBook } from "@/lib/shop/types";

// The signed-in user's sales & stock book: GET loads it, PUT autosaves the whole book.

export async function GET(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return fail("Bạn cần đăng nhập.", 401);
  try {
    return ok(await loadBook(user.id));
  } catch (e) {
    console.error("[shop] load failed:", (e as Error).message);
    return fail("Không tải được sổ hàng, vui lòng thử lại.", 500);
  }
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const user = await userFromRequest(request);
  if (!user) return fail("Phiên đăng nhập đã hết, hãy đăng nhập lại.", 401);
  if (!rateLimit(`shop:save:${user.id}`, 400, 10 * 60_000).ok) return fail("Bạn lưu quá nhanh, vui lòng thử lại sau ít phút.", 429);
  if (Number(request.headers.get("content-length") ?? 0) > LIMITS.bytes) return fail("Sổ hàng quá lớn, hãy sao lưu rồi xoá bớt phiếu cũ.", 413);

  const body = await readJson(request);
  const version = Number(body?.version);
  if (!body || !Number.isInteger(version) || version < 0) return fail("Dữ liệu không hợp lệ.");
  const book = sanitizeBook(body.book);
  try {
    const next = await saveBook(user.id, book, version);
    if (next === null) return fail("Sổ hàng vừa được sửa ở thiết bị khác.", 409);
    return ok({ version: next });
  } catch (e) {
    console.error("[shop] save failed:", (e as Error).message);
    return fail("Không lưu được, vui lòng thử lại.", 500);
  }
}
