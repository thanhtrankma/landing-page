import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import TemplateGallery from "@/components/cards/TemplateGallery";
import { Button, Heading } from "@/components/ui";
import { listPublishedTemplates } from "@/lib/cards/server";
import { CARD_FORMATS } from "@/lib/cards/types";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";

const PATH = "/cong-cu/anh-thiep-cuoi";

export const metadata = pageMetadata({
  title: "Thiết Kế Ảnh Thiệp Cưới Để In Miễn Phí – Tải PNG/PDF | SuperLanding",
  description:
    "Thiết kế ảnh thiệp cưới miễn phí: chọn mẫu, điền tên cô dâu chú rể, thêm ảnh cưới và tải về PNG/PDF đúng khổ để in.",
  path: PATH,
  keywords: "thiết kế thiệp cưới, mẫu thiệp cưới để in, tải thiệp cưới pdf, ảnh thiệp cưới",
});

const steps: [string, string][] = [
  ["Chọn mẫu", "Chọn một mẫu thiệp có sẵn hoặc bắt đầu từ trang trắng với khổ dọc, ngang, vuông hay story."],
  ["Điền thông tin", "Nhập tên cô dâu chú rể, ngày giờ, địa điểm và thêm ảnh cưới. Thiệp cập nhật ngay khi bạn gõ."],
  ["Tải về hoặc chia sẻ", "Tải thiệp PNG, JPG, PDF chất lượng in, hoặc gửi link thiệp online cho khách mời."],
];

const features: [string, string][] = [
  ["Font tiếng Việt đẹp", "12 font chữ thư pháp, có chân, hiện đại hiển thị chuẩn dấu tiếng Việt."],
  ["Ảnh cưới trong khung", "Đặt ảnh vào khung tròn, vòm, bo góc; kéo để chỉnh khung hình."],
  ["Xuất file in ấn", "PNG 2000px, PDF đúng khổ 13×18cm, 300 DPI gửi thẳng cho tiệm in."],
  ["Link thiệp online", "Mỗi thiệp có link riêng để gửi qua Zalo, Messenger, Facebook."],
  ["Không cần tài khoản", "Lưu thiệp và sửa lại bất cứ lúc nào bằng link chỉnh sửa riêng."],
  ["Dùng tốt trên điện thoại", "Giao diện tối ưu cho màn hình nhỏ, thao tác bằng một tay."],
];

const faqs: [string, string][] = [
  ["Tạo thiệp cưới online có mất phí không?", "Hoàn toàn miễn phí. Bạn có thể tạo, tải về và chia sẻ thiệp không giới hạn, không cần đăng ký tài khoản."],
  ["File tải về có đủ nét để in không?", "Có. File PNG có độ phân giải gấp đôi khổ thiệp (2000×2800px với thiệp 5×7) và file PDF được xuất đúng khổ 127×178mm ở 300 DPI, đủ cho in ấn thông thường."],
  ["Làm sao để sửa lại thiệp đã lưu?", "Khi lưu lần đầu, bạn nhận được một link chỉnh sửa riêng. Trên thiết bị đã tạo thiệp, bạn chỉ cần mở lại link đó. Hãy lưu link này lại vì ai có link đều sửa được thiệp."],
  ["Ảnh cưới tôi tải lên có an toàn không?", "Ảnh được nén và xoá thông tin vị trí (GPS) ngay trên máy bạn trước khi tải lên. Trang chia sẻ thiệp không hiển thị trên Google."],
  ["Tôi có thể gửi thiệp cho khách mời như thế nào?", "Bấm “Chia sẻ” để nhận link thiệp online rồi gửi qua Zalo, Messenger, Facebook; hoặc tải ảnh JPG về và gửi trực tiếp."],
];

export default async function WeddingCardToolPage() {
  const templates = await listPublishedTemplates();
  const url = `${SITE_URL}${PATH}`;
  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          {
            "@type": "WebApplication",
            "@id": `${url}#app`,
            name: "Thiết kế ảnh thiệp cưới – SuperLanding",
            url,
            applicationCategory: "DesignApplication",
            operatingSystem: "Web",
            inLanguage: "vi-VN",
            offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@type": "FAQPage",
            mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
          },
          breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", PATH], ["Thiết kế ảnh thiệp cưới", PATH]]),
        )}
      />

      <section className="sub-hero compact cards-hero">
        <div className="gv-wrap center fade-in-up">
          <span>CÔNG CỤ MIỄN PHÍ</span>
          <h1>
            Thiết kế ảnh thiệp cưới
            <br />
            <em>để in hoặc gửi ảnh.</em>
          </h1>
          <p>Chọn mẫu, điền tên cô dâu chú rể, thêm ảnh cưới. Tải về để in hoặc gửi link thiệp cho khách mời chỉ trong vài phút.</p>
          <div className="cards-hero-actions">
            <Button href="#mau-thiep">Chọn mẫu thiệp</Button>
            <Button href="#trang-trang" light>
              Thiết kế từ trang trắng
            </Button>
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
          <Heading center eyebrow="KHO MẪU" title="Mẫu thiệp cưới đẹp, chỉnh sửa trong vài phút" text="Bấm vào mẫu bạn thích để mở trình thiết kế. Mọi chữ, màu, ảnh đều thay đổi được." />
          <TemplateGallery templates={templates.map(({ id, slug, name, tags, width, height, canvas, thumbUrl }) => ({ id, slug, name, tags, width, height, canvas, thumbUrl }))} />
        </div>
      </section>

      <section id="trang-trang">
        <div className="gv-wrap">
          <Heading center eyebrow="TỰ THIẾT KẾ" title="Bắt đầu từ trang trắng" text="Chọn khổ thiệp rồi tự do sắp xếp chữ, ảnh và hoạ tiết." />
          <div className="cards-formats">
            {CARD_FORMATS.map((f) => (
              <Link key={f.id} href={`${PATH}/tao?kho=${f.id}`} className="cards-format">
                <span className="cards-format-shape" style={{ aspectRatio: `${f.width} / ${f.height}` }} />
                <b>{f.label}</b>
                <small>
                  {f.mm[0].toFixed(0)}×{f.mm[1].toFixed(0)}mm
                </small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="surface">
        <div className="gv-wrap">
          <Heading center eyebrow="TÍNH NĂNG" title="Mọi thứ cần cho một tấm thiệp cưới" />
          <div className="cards-features">
            {features.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
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
            <h2>Muốn thiệp cưới online có nhạc, album và xác nhận tham dự?</h2>
            <p>Tạo thiệp cưới dạng trang web miễn phí, gửi link cho bạn bè và người thân qua Zalo, Messenger.</p>
          </div>
          <Button href="/cong-cu/thiep-cuoi-online">Tạo thiệp cưới online</Button>
        </div>
      </section>
    </main>
  );
}
