import { rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { userFromRequest } from "@/lib/account/server";
import { bookAccess, loadBook, saveBook } from "@/lib/shop/server";
import { LIMITS, sanitizeBook } from "@/lib/shop/types";

// One sales & stock book the signed-in user may open (theirs or shared with them).
// GET ?book=<id>[&v=<version>] loads it (or says it is unchanged); PUT autosaves the whole book.

const NO_ACCESS = "Bạn không còn quyền vào sổ hàng này.";

export async function GET(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return fail("Bạn cần đăng nhập.", 401);
  const url = new URL(request.url);
  const bookId = url.searchParams.get("book") ?? "";
  const have = url.searchParams.get("v");
  try {
    const access = await bookAccess(user, bookId);
    if (!access) return fail(NO_ACCESS, 403);
    const data = await loadBook(bookId, have !== null && /^\d+$/.test(have) ? Number(have) : undefined);
    if (!data) return fail(NO_ACCESS, 403);
    return ok({ ...data, role: access.role });
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
  const bookId = String(body?.bookId ?? "");
  if (!body || !Number.isInteger(version) || version < 1) return fail("Dữ liệu không hợp lệ.");
  try {
    const access = await bookAccess(user, bookId);
    if (!access) return fail(NO_ACCESS, 403);
    if (access.role === "viewer") return fail("Bạn chỉ có quyền xem sổ hàng này.", 403);
    const next = await saveBook(bookId, sanitizeBook(body.book), version);
    if (next === null) return fail("Sổ hàng vừa được người khác sửa.", 409);
    return ok({ version: next });
  } catch (e) {
    console.error("[shop] save failed:", (e as Error).message);
    return fail("Không lưu được, vui lòng thử lại.", 500);
  }
}
