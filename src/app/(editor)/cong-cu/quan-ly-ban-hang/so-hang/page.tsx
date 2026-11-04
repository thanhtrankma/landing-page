import type { Metadata } from "next";
import AppBar from "@/components/account/AppBar";
import ShopApp from "@/components/shop/ShopApp";
import { requireUser } from "@/lib/account/server";
import { loadBook } from "@/lib/shop/server";
import { SHOP_APP, SHOP_TOOL } from "@/lib/shop/tool";

export const metadata: Metadata = { title: "Sổ hàng của tôi | SuperLanding" };

export default async function ShopBookPage() {
  const user = await requireUser(SHOP_APP);
  const stored = await loadBook(user.id).catch((e: Error) => {
    console.error("[shop] load failed:", e.message);
    return null;
  });
  return (
    <div className="tl">
      <AppBar user={user} tool={SHOP_TOOL} />
      {stored ? (
        <ShopApp initial={stored.book} initialVersion={stored.version} />
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
