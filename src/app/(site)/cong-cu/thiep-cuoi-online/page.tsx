import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { Button, Heading } from "@/components/ui";
import { DEMO_SLUG } from "@/lib/invites/defaults";
import { demoSlug, INVITE_THEMES } from "@/lib/invites/types";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";

const PATH = "/cong-cu/thiep-cuoi-online";
const CREATE = `${PATH}/tao`;
const DEMO = `/thiep/${DEMO_SLUG}`;

export const metadata = pageMetadata({
  title: "Tạo Thiệp Cưới Online Miễn Phí – Gửi Link Qua Zalo, Messenger | SuperLanding",
  description:
    "Tạo thiệp cưới online miễn phí: điền tên cô dâu chú rể, thêm ảnh cưới, nhạc nền, bản đồ, lời chúc & xác nhận tham dự. Nhận link thiệp riêng để gửi cho bạn bè, người thân.",
  path: PATH,
  keywords: "thiệp cưới online, tạo thiệp cưới online miễn phí, thiệp cưới điện tử, thiệp mời cưới online, link thiệp cưới",
});

const steps: [string, string][] = [
  ["Điền thông tin", "Tên cô dâu chú rể, gia đình hai bên, ngày giờ và địa điểm tổ chức. Ngày âm lịch được tính tự động."],
  ["Thêm ảnh & nhạc", "Ảnh bìa, album ảnh cưới, nhạc nền. Xem trước ngay trong khung điện thoại khi bạn chỉnh sửa."],
  ["Gửi link cho khách", "Nhận link superlanding.vn/thiep/ten-cua-ban, tạo link có tên từng khách và gửi qua Zalo, Messenger."],
];

const features: [string, string][] = [
  ["Lời mời có tên từng khách", "Mỗi người nhận một link riêng, thiệp hiện “Kính gửi Anh Nam & chị Lan”."],
  ["Lời chúc & xác nhận tham dự", "Khách gửi lời chúc, xác nhận đi hay không và số người. Bạn xem thống kê, xuất Excel."],
  ["Chỉ đường & lưu lịch", "Mỗi sự kiện có nút mở Google Maps và thêm vào lịch điện thoại."],
  ["Album & nhạc nền", "Tối đa 24 ảnh cưới, xem toàn màn hình; nhạc nền phát khi khách mở thiệp."],
  ["Hộp mừng cưới", "Hiện mã QR và số tài khoản, khách bấm để sao chép."],
  ["Không cần tài khoản", "Lưu thiệp và sửa bất cứ lúc nào bằng link chỉnh sửa riêng của bạn."],
];

const faqs: [string, string][] = [
  ["Tạo thiệp cưới online có mất phí không?", "Hoàn toàn miễn phí: tạo thiệp, nhận link, nhận lời chúc và xác nhận tham dự không giới hạn."],
  ["Làm sao để gửi thiệp có tên từng khách?", "Sau khi lưu, bấm “Chia sẻ”, nhập tên khách để nhận link riêng. Thiệp mở ra sẽ hiện “Kính gửi” kèm tên người đó."],
  ["Tôi sửa thiệp sau khi đã gửi được không?", "Được. Mọi chỉnh sửa hiển thị ngay trên link cũ, khách không cần nhận link mới."],
  ["Làm sao để mở lại trang chỉnh sửa?", "Khi lưu lần đầu bạn nhận được link chỉnh sửa riêng. Trên thiết bị đã tạo thiệp chỉ cần mở lại trang; sang máy khác thì dùng link đó."],
  ["Thiệp có hiện trên Google không?", "Không. Trang thiệp được chặn tìm kiếm, chỉ người có link mới xem được."],
];

export default function WeddingInviteToolPage() {
  const url = `${SITE_URL}${PATH}`;
  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          {
            "@type": "WebApplication",
            "@id": `${url}#app`,
            name: "Tạo thiệp cưới online – SuperLanding",
            url,
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            inLanguage: "vi-VN",
            offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          { "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
          breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", PATH], ["Tạo thiệp cưới online", PATH]]),
        )}
      />

      <section className="invite-hero">
        <div className="gv-wrap invite-hero-grid">
          <div className="invite-hero-copy fade-in-up">
            <span className="invite-eyebrow">CÔNG CỤ MIỄN PHÍ</span>
            <h1>
              Thiệp cưới online
              <br />
              <em>gửi bằng một đường link.</em>
            </h1>
            <p>Tạo trang thiệp cưới có ảnh, nhạc nền, bản đồ, lời chúc và xác nhận tham dự. Copy link gửi cho bạn bè, người thân qua Zalo, Messenger chỉ trong vài phút.</p>
            <div className="cards-hero-actions left">
              <Button href={CREATE}>Tạo thiệp ngay</Button>
              <Button href={DEMO} light>
                Xem thiệp mẫu
              </Button>
            </div>
            <ul className="invite-checks">
              <li>Miễn phí, không cần tài khoản</li>
              <li>Link có tên từng khách mời</li>
              <li>Tối ưu cho điện thoại</li>
            </ul>
          </div>
          <div className="invite-hero-phone">
            <div className="invite-phone">
              <iframe src={`${DEMO}?khach=Bạn`} title="Thiệp cưới online mẫu" loading="lazy" />
            </div>
            <Link href={DEMO} className="invite-phone-link" target="_blank">
              Mở thiệp mẫu trong tab mới ↗
            </Link>
          </div>
        </div>
      </section>

      <section className="cards-steps">
        <div className="gv-wrap">
          <ol>
            {steps.map(([title, text], i) => (
              <li key={title}>
                <b>0{i + 1}</b>
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="surface" id="mau-thiep">
        <div className="gv-wrap">
          <Heading center eyebrow="KHO MẪU" title="Chọn mẫu thiệp bạn yêu thích" text="Cuộn thử ngay trong khung điện thoại. Đổi mẫu bất cứ lúc nào mà không mất nội dung đã nhập." />
          <div className="invite-themes">
            {INVITE_THEMES.map((t) => (
              <article key={t.id} className="invite-theme">
                <div className="invite-phone small">
                  <iframe src={`/thiep/${demoSlug(t.id)}?khach=Bạn`} title={`Mẫu thiệp ${t.name}`} loading="lazy" />
                </div>
                <h3>{t.name}</h3>
                <p>{t.note}</p>
                <div className="invite-theme-actions">
                  <Link href={`${CREATE}?mau=${t.id}`} className="gv-btn">
                    Dùng mẫu này
                  </Link>
                  <Link href={`/thiep/${demoSlug(t.id)}`} target="_blank" className="invite-phone-link">
                    Xem toàn màn hình ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="gv-wrap">
          <Heading center eyebrow="TÍNH NĂNG" title="Mọi thứ khách mời cần, trong một đường link" />
          <div className="cards-features">
            {features.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="cards-hero-actions">
            <Button href={CREATE}>Bắt đầu tạo thiệp</Button>
          </div>
        </div>
      </section>

      <section>
        <div className="gv-wrap cards-faq">
          <Heading center eyebrow="HỎI ĐÁP" title="Câu hỏi thường gặp" />
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cards-promo">
        <div className="gv-wrap">
          <div>
            <h2>Cần thêm thiệp giấy để in?</h2>
            <p>Dùng công cụ thiết kế ảnh thiệp cưới: chọn mẫu, điền thông tin và tải về PNG/PDF đúng khổ in.</p>
          </div>
          <Button href="/cong-cu/anh-thiep-cuoi" light>
            Thiết kế ảnh thiệp in
          </Button>
        </div>
      </section>
    </main>
  );
}
