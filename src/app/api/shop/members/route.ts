import { rateLimit } from "@/lib/rate-limit";
import { fail, ok, readJson, sameOrigin } from "@/lib/cards/http";
import { sendMail, userFromRequest, validEmail } from "@/lib/account/server";
import { addMember, bookAccess, bookOwner, bookTitle, leaveBook, listMembers, MAX_MEMBERS, removeMember, setMemberRole, type MemberRole } from "@/lib/shop/server";
import { SHOP_APP } from "@/lib/shop/tool";

// "Người cùng quản lý": everyone in a book can see who is in it; only the owner invites, changes roles
// and removes people; a member can leave.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function snapshot(bookId: string, ownerId: string) {
  const [members, owner] = await Promise.all([listMembers(bookId), bookOwner(ownerId)]);
  return { members, owner };
}

export async function GET(request: Request) {
  const user = await userFromRequest(request);
  if (!user) return fail("Bạn cần đăng nhập.", 401);
  const bookId = new URL(request.url).searchParams.get("book") ?? "";
  const access = await bookAccess(user, bookId);
  if (!access) return fail("Bạn không còn quyền vào sổ hàng này.", 403);
  return ok({ ...(await snapshot(bookId, access.ownerId)), role: access.role });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Yêu cầu không hợp lệ.", 403);
  const user = await userFromRequest(request);
  if (!user) return fail("Phiên đăng nhập đã hết, hãy đăng nhập lại.", 401);
  const body = await readJson(request);
  const bookId = String(body?.book ?? "");
  const access = await bookAccess(user, bookId);
  if (!access) return fail("Bạn không còn quyền vào sổ hàng này.", 403);
  const action = String(body?.action ?? "");
  const role: MemberRole = body?.role === "viewer" ? "viewer" : "editor";

  if (action === "leave") {
    if (access.role === "owner") return fail("Chủ sổ không thể rời sổ của mình.");
    await leaveBook(bookId, user.email);
    return ok({ left: true });
  }
  if (access.role !== "owner") return fail("Chỉ chủ sổ mới mời hoặc bớt người được.", 403);

  if (action === "role") await setMemberRole(bookId, String(body?.member ?? ""), role);
  else if (action === "remove") await removeMember(bookId, String(body?.member ?? ""));
  else if (action === "add") {
    if (!rateLimit(`shop:invite:${user.id}`, 30, 60 * 60_000).ok) return fail("Bạn mời quá nhiều lần, vui lòng thử lại sau.", 429);
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!validEmail(email)) return fail("Email không hợp lệ.");
    if (email === user.email) return fail("Đây là email của bạn.");
    const current = await listMembers(bookId);
    if (!current.some((m) => m.email === email) && current.length >= MAX_MEMBERS) return fail(`Mỗi sổ mời tối đa ${MAX_MEMBERS} người.`);
    const added = await addMember(bookId, email, role, user.id);
    let emailed = false;
    if (added) {
      const link = `${new URL(request.url).origin}${SHOP_APP}?so=${bookId}`;
      const who = user.name || user.email;
      const shop = (await bookTitle(bookId)) || "sổ hàng";
      const what = role === "viewer" ? "xem" : "cùng quản lý";
      const text = `${who} mời bạn ${what} ${shop} trên SuperLanding (nhập – bán hàng, tồn kho, đơn hàng). Mở ${link} và đăng nhập bằng email ${email} để vào sổ.`;
      const html = `<div style="font-family:Arial,sans-serif;max-width:460px;margin:auto;padding:24px;color:#0b2a3c">
        <h2 style="margin:0 0 12px">Bạn được mời vào sổ hàng</h2>
        <p style="margin:0 0 16px"><b>${esc(who)}</b> mời bạn ${what} <b>${esc(shop)}</b>: nhập – bán hàng, tồn kho và đơn đặt hàng.</p>
        <p style="margin:0 0 18px"><a href="${esc(link)}" style="display:inline-block;background:#0b6fa4;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Mở sổ hàng</a></p>
        <p style="margin:0;color:#52697a;font-size:13px">Đăng nhập bằng đúng email này (${esc(email)}) để vào sổ. Nếu bạn không quen người mời, hãy bỏ qua email này.</p></div>`;
      try {
        await sendMail(email, `${who} mời bạn ${what} ${shop}`, html, text);
        emailed = true;
      } catch (e) {
        console.error("[shop] invite mail failed:", (e as Error).message);
      }
    }
    return ok({ ...(await snapshot(bookId, access.ownerId)), emailed });
  } else return fail("Yêu cầu không hợp lệ.");

  return ok(await snapshot(bookId, access.ownerId));
}
