import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppBar from "@/components/account/AppBar";
import LoginForm from "@/components/account/LoginForm";
import { currentUser, safeNext } from "@/lib/account/server";
import { googleConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Đăng nhập | Thiệp cưới online SuperLanding" };

const ERRORS: Record<string, string> = {
  google: "Đăng nhập Google không thành công, hãy thử lại hoặc dùng email.",
  state: "Phiên đăng nhập đã hết hạn, hãy thử lại.",
};

export default async function LoginPage({ searchParams }: PageProps<"/dang-nhap">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : undefined);
  if (await currentUser()) redirect(next);
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;
  return (
    <div className="tl">
      <AppBar user={null} />
      <main className="lg-wrap">
        <LoginForm next={next} googleEnabled={googleConfigured()} initialError={error} />
      </main>
    </div>
  );
}
