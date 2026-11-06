import JsonLd from "@/components/JsonLd";
import { Button, Heading } from "@/components/ui";
import { SHOP_APP, SHOP_PATH } from "@/lib/shop/tool";
import { SITE_URL, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import "../cards.css";
import "./intro.css";

export const metadata = pageMetadata({
  title: "Quản Lý Bán Hàng, Xuất Nhập Tồn Kho Miễn Phí Cho Shop Hoa | SuperLanding",
  description:
    "Sổ quản lý bán hàng online miễn phí cho shop nhỏ: lưu mẫu hàng có ảnh, giá nhập, giá bán, nguồn lấy hàng; ghi phiếu nhập, đơn bán, tự tính tồn kho, lãi và công nợ. Dùng trên điện thoại và máy tính.",
  path: SHOP_PATH,
  keywords: "quản lý bán hàng, quản lý xuất nhập tồn, sổ bán hàng online, quản lý shop hoa, quản lý kho hoa sáp, hoa lụa",
});

const steps: [string, string][] = [
  ["Thêm mẫu hàng", "Chụp ảnh mẫu, đặt mã, ghi giá nhập, giá bán, màu, kích thước và nơi lấy hàng."],
  ["Ghi phiếu nhập", "Mỗi lần lấy hàng về, ghi số lượng và giá: tồn kho được cộng, giá vốn tự tính trung bình."],
  ["Chốt đơn bán", "Chọn mẫu, số lượng, khách và kênh bán. Kho tự trừ, lãi của từng đơn hiện ngay."],
];

const features: [string, string][] = [
  ["Tồn kho luôn đúng", "Tồn = nhập − bán ± điều chỉnh. Cảnh báo khi mẫu sắp hết để kịp lấy thêm hàng."],
  ["Lãi thật của từng tháng", "Doanh thu, giá vốn, lãi gộp, tiền nhập hàng và giá trị hàng còn trong kho."],
  ["Nguồn hàng rõ ràng", "Số điện thoại, Zalo, địa chỉ, link shop của từng mối sỉ và tổng tiền đã nhập."],
  ["Đơn chờ giao & công nợ", "Đánh dấu đơn chờ giao, đơn COD chưa thu tiền, nợ nhà cung cấp."],
  ["Nhiều người cùng quản lý", "Mời nhân viên, người nhà vào chung một sổ bằng email: ai bán, ai nhập đều tự cập nhật, mỗi đơn ghi rõ người tạo."],
  ["Ghi chú cho shop", "Ý tưởng mẫu mới, đơn đặt trước, việc cần làm: ghim lên đầu để không quên."],
  ["Xuất Excel & sao lưu", "Tải danh sách tồn kho, sổ nhập bán ra Excel; sao lưu toàn bộ dữ liệu về máy."],
];

const faqs: [string, string][] = [
  ["Công cụ có mất phí không?", "Miễn phí. Bạn chỉ cần đăng nhập bằng Google hoặc email để dữ liệu được lưu theo tài khoản."],
  ["Dùng trên điện thoại được không?", "Được. Giao diện tối ưu cho điện thoại; dữ liệu đồng bộ nên nhập trên máy tính, xem trên điện thoại đều được."],
  ["Người khác có xem được dữ liệu của tôi không?", "Không, trừ những người bạn mời. Sổ hàng chỉ mở được khi đăng nhập đúng tài khoản của bạn hoặc email bạn đã mời; bạn có thể bớt người ra bất cứ lúc nào."],
  ["Nhân viên cùng ghi đơn được không?", "Được. Vào Chia sẻ, nhập email nhân viên và chọn quyền “Cùng quản lý” hoặc “Chỉ xem”. Nhiều người ghi cùng lúc vẫn không mất đơn nào: thay đổi của mọi người được gộp lại tự động."],
  ["Giá vốn được tính thế nào?", "Lấy trung bình theo số lượng của các lần nhập. Lãi mỗi đơn = tiền hàng sau giảm giá − giá vốn trung bình × số lượng."],
  ["Hoa bị hỏng, gãy thì ghi thế nào?", "Dùng phiếu “Điều chỉnh kho” với số âm. Khi kiểm kho thấy dư thì ghi số dương."],
];

export default function ShopToolPage() {
  const url = `${SITE_URL}${SHOP_PATH}`;
  return (
    <main className="cards-page">
      <JsonLd
        data={graph(
          {
            "@type": "WebApplication",
            "@id": `${url}#app`,
            name: "Quản lý bán hàng – SuperLanding",
            url,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            inLanguage: "vi-VN",
            offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          { "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
          breadcrumbJsonLd(url, [["Trang chủ", "/"], ["Công cụ", SHOP_PATH], ["Quản lý bán hàng", SHOP_PATH]]),
        )}
      />

      <section className="invite-hero">
        <div className="gv-wrap invite-hero-grid">
          <div className="invite-hero-copy fade-in-up">
            <span className="invite-eyebrow">CÔNG CỤ MIỄN PHÍ</span>
            <h1>
              Sổ bán hàng
              <br />
              <em>cho shop hoa sáp, hoa lụa.</em>
            </h1>
            <p>Quản lý mẫu hàng, giá nhập – giá bán, chỗ lấy hàng, phiếu nhập và đơn bán ở một nơi. Tồn kho, lãi và công nợ được tính tự động.</p>
            <div className="cards-hero-actions left">
              <Button href={SHOP_APP}>Mở sổ hàng</Button>
            </div>
            <ul className="invite-checks">
              <li>Miễn phí, đăng nhập Google hoặc email</li>
              <li>Đồng bộ điện thoại & máy tính</li>
              <li>Xuất Excel</li>
            </ul>
          </div>
          <div className="shop-demo" aria-hidden="true">
            <div className="shop-demo-kpis">
              <div>
                <span>Doanh thu tháng</span>
                <b>18.450.000đ</b>
              </div>
              <div className="good">
                <span>Lãi gộp</span>
                <b>7.320.000đ</b>
              </div>
            </div>
            <ul>
              <li>
                <i style={{ background: "#fde7ef" }}>🌹</i>
                <span>
                  <b>Bó hồng sáp 9 bông</b>
                  <small>HS-004 · Hoa sáp</small>
                </span>
                <em>Tồn 12</em>
              </li>
              <li>
                <i style={{ background: "#e5f4ea" }}>🌿</i>
                <span>
                  <b>Lan hồ điệp lụa 5 cành</b>
                  <small>HL-011 · Hoa lụa</small>
                </span>
                <em className="low">Còn 2</em>
              </li>
              <li>
                <i style={{ background: "#fff7d6" }}>🌼</i>
                <span>
                  <b>Giỏ cúc hoạ mi để bàn</b>
                  <small>HL-007 · Hoa lụa</small>
                </span>
                <em>Tồn 8</em>
              </li>
            </ul>
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

      <section>
        <div className="gv-wrap">
          <Heading center eyebrow="TÍNH NĂNG" title="Đủ cho một shop nhỏ, không rườm rà" />
          <div className="cards-features">
            {features.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="cards-hero-actions">
            <Button href={SHOP_APP}>Bắt đầu quản lý</Button>
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
    </main>
  );
}
