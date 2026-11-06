import type { Metadata } from "next";
import { cookies } from "next/headers";
import AppBar from "@/components/account/AppBar";
import ShopApp from "@/components/shop/ShopApp";
import { requireUser } from "@/lib/account/server";
import { openBook } from "@/lib/shop/server";
import { SHOP_APP, SHOP_BOOK_COOKIE, SHOP_TOOL } from "@/lib/shop/tool";

export const metadata: Metadata = { title: "Sổ hàng của tôi | SuperLanding" };

// ?so=<book id> opens a book shared with you (the invite link); otherwise the one open last time.
export default async function ShopBookPage({ searchParams }: PageProps<"/cong-cu/quan-ly-ban-hang/so-hang">) {
  const sp = await searchParams;
  const wanted = typeof sp.so === "string" ? sp.so : undefined;
  const user = await requireUser(wanted ? `${SHOP_APP}?so=${encodeURIComponent(wanted)}` : SHOP_APP);
  const last = (await cookies()).get(SHOP_BOOK_COOKIE)?.value;
  const opened = await openBook(user, [wanted, last]).catch((e: Error) => {
    console.error("[shop] load failed:", e.message);
    return null;
  });
  return (
    <div className="tl">
      <AppBar user={user} tool={SHOP_TOOL} />
      {opened && wanted && opened.current.id !== wanted && (
        <div className="sh-notice" role="status">
          Bạn chưa được mời vào sổ hàng trong link này (hoặc đã bị bớt ra). Hãy kiểm tra đã đăng nhập đúng email được mời: <b>{user.email}</b>.
        </div>
      )}
      {opened ? (
        <ShopApp
          key={opened.current.id}
          initial={opened.stored.book}
          initialVersion={opened.stored.version}
          bookId={opened.current.id}
          role={opened.current.role}
          books={opened.books}
          me={user.name || user.email}
        />
      ) : (
        <main className="tl-main">
          <div className="db-empty">
            <h2>Chưa mở được sổ hàng</h2>
            <p>Hệ thống đang bận hoặc chưa được cài đặt xong. Vui lòng tải lại trang sau ít phút.</p>
          </div>
        </main>
      )}
    </div>
  );
}
