// Sample content — swap these arrays with your real copy, pricing and case
// studies. Structure mirrors the live site's sections so you can drop data
// straight in without touching component markup.

export const nav = [
  { label: "Trang chủ", href: "#top" },
  { label: "Dịch vụ", href: "#services" },
  { label: "Dự án", href: "#work" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "Liên hệ", href: "#contact" },
];

export const heroRotatingWords = [
  "Landing Page theo yêu cầu.",
  "Website chuẩn SEO.",
  "Giao diện độc quyền.",
];

export const industries = [
  "Bán lẻ",
  "F&B",
  "Bất động sản",
  "Nội thất",
  "Khách sạn",
  "Giáo dục",
  "Du lịch",
];

export type Service = {
  index: string;
  title: string;
  description: string;
  points: string[];
};

export const services: Service[] = [
  {
    index: "01",
    title: "Thiết Kế Website",
    description:
      "Xây dựng website chuyên nghiệp, tối ưu tốc độ tải và khả năng hiển thị trên mọi thiết bị.",
    points: [
      "Giao diện theo nhận diện thương hiệu",
      "Nền tảng SEO kỹ thuật ngay từ đầu",
      "Cấu trúc dễ mở rộng và quản trị",
    ],
  },
  {
    index: "02",
    title: "Thiết Kế Landing Page",
    description:
      "Landing Page tập trung vào một mục tiêu chuyển đổi, bám sát thông điệp từng chiến dịch.",
    points: [
      "Cấu trúc nội dung theo hành trình khách hàng",
      "CTA và biểu mẫu được đặt đúng thời điểm",
      "Tối ưu trải nghiệm trên di động",
    ],
  },
  {
    index: "03",
    title: "Tối Ưu & Chăm Sóc Website",
    description:
      "Theo dõi hiệu năng, bảo mật và cập nhật nội dung định kỳ để hệ thống vận hành ổn định.",
    points: [
      "Đánh giá hiệu năng thực tế định kỳ",
      "Rà soát SEO kỹ thuật và bảo mật",
      "Gói chăm sóc linh hoạt theo phạm vi",
    ],
  },
  {
    index: "04",
    title: "Lập Trình Web App",
    description:
      "Phát triển ứng dụng web, hệ thống quản lý và số hóa quy trình vận hành riêng.",
    points: [
      "Giao diện quản trị và phân quyền",
      "Số hóa quy trình vận hành đặc thù",
      "Kiến trúc sẵn sàng mở rộng về sau",
    ],
  },
];

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  { number: "01", title: "Nghiên cứu", description: "Lắng nghe nhu cầu và phân tích thị trường." },
  { number: "02", title: "Chiến lược", description: "Xây dựng cấu trúc và luồng trải nghiệm." },
  { number: "03", title: "Thiết kế", description: "Thiết kế nhận diện và tương tác hiện đại." },
  { number: "04", title: "Bàn giao", description: "Lập trình, kiểm thử và bàn giao hoàn thiện." },
];

export type PortfolioItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  gradient: string;
};

// Sample entries only — replace with your real, named projects and images.
export const portfolioCategories = [
  "Tất cả",
  "Bán hàng",
  "Công ty",
  "Bất động sản",
  "Nội thất",
  "Du lịch",
  "Landing Page",
];

export const portfolioItems: PortfolioItem[] = [
  {
    id: "DA-01",
    category: "Bán hàng",
    title: "Dự án website ẩm thực địa phương",
    description: "Thực đơn, đặt bàn và giới thiệu thương hiệu nhà hàng.",
    gradient: "from-brand-500 to-brand-700",
  },
  {
    id: "DA-02",
    category: "Công ty",
    title: "Dự án website beauty salon",
    description: "Trang giới thiệu dịch vụ và đặt lịch chăm sóc sắc đẹp.",
    gradient: "from-emerald-400 to-brand-600",
  },
  {
    id: "DA-03",
    category: "Công ty",
    title: "Dự án website dịch vụ spa nam giới",
    description: "Landing page giới thiệu liệu trình và ưu đãi theo mùa.",
    gradient: "from-lime-400 to-emerald-600",
  },
  {
    id: "DA-04",
    category: "Bất động sản",
    title: "Dự án website xây dựng & thiết kế",
    description: "Portfolio công trình và biểu mẫu nhận tư vấn dự án.",
    gradient: "from-brand-400 to-teal-600",
  },
  {
    id: "DA-05",
    category: "Landing Page",
    title: "Dự án landing page thiết bị thông minh",
    description: "Trang giới thiệu sản phẩm và thu khách hàng tiềm năng.",
    gradient: "from-teal-400 to-brand-700",
  },
  {
    id: "DA-06",
    category: "Nội thất",
    title: "Dự án website nội thất hiện đại",
    description: "Thư viện sản phẩm 3D và tư vấn thiết kế không gian.",
    gradient: "from-brand-500 to-emerald-800",
  },
];

export type PricingTier = {
  badge?: string;
  duration: string;
  tag: string;
  name: string;
  description: string;
  priceFrom: string;
  features: string[];
  featured?: boolean;
  ctaLabel: string;
};

export const pricingTiers: PricingTier[] = [
  {
    duration: "3-5 NGÀY",
    tag: "WEBLANDING / CƠ BẢN",
    name: "Cơ Bản",
    description: "Landing Page hoàn chỉnh, tối ưu hiển thị di động và chuyển đổi khách hàng.",
    priceFrom: "449.000đ",
    features: [
      "01 trang bán hàng (Landing Page)",
      "Chuẩn hiển thị di động (Responsive)",
      "Mẫu đăng ký và nút CTA tối ưu",
      "Bảo hành 4 tháng",
    ],
    ctaLabel: "Bắt đầu ngay",
  },
  {
    badge: "Phổ biến nhất",
    duration: "7-15 NGÀY",
    tag: "WEBLANDING / TIÊU CHUẨN",
    name: "Tiêu Chuẩn",
    description: "Website giới thiệu doanh nghiệp, chuẩn SEO và dễ tự quản lý.",
    priceFrom: "1.899.000đ",
    features: [
      "Các trang giới thiệu, dịch vụ chi tiết",
      "Hệ thống quản trị nội dung (Admin)",
      "Quản lý dự án, bài viết & tin tức",
      "Bảo hành 12 tháng",
    ],
    featured: true,
    ctaLabel: "Bắt đầu ngay",
  },
  {
    duration: "THEO PHẠM VI",
    tag: "WEBLANDING / CAO CẤP",
    name: "Cao Cấp",
    description: "Website bán hàng đa chức năng, đầy đủ giỏ hàng và quản lý sản phẩm.",
    priceFrom: "6.000.000đ",
    features: [
      "Quản lý sản phẩm và danh mục",
      "Giỏ hàng, đặt hàng trực tuyến",
      "Quản lý đơn hàng & khách hàng",
      "Bảo hành 12 tháng",
    ],
    ctaLabel: "Bắt đầu ngay",
  },
  {
    duration: "THEO GIAI ĐOẠN",
    tag: "WEBLANDING / THEO YÊU CẦU",
    name: "Theo Yêu Cầu",
    description: "Web App custom, hệ thống quản trị và vận hành số hóa riêng theo giai đoạn.",
    priceFrom: "Báo giá riêng",
    features: [
      "Phân tích nghiệp vụ & giải pháp riêng",
      "Quản trị tài khoản & phân quyền",
      "Dashboard thống kê & xử lý dữ liệu",
      "Bảo hành 12 tháng",
    ],
    ctaLabel: "Liên hệ tư vấn",
  },
];

export type FaqItem = { question: string; answer: string };

export const faqItems: FaqItem[] = [
  {
    question: "Tôi có thể nâng cấp gói dịch vụ sau này không?",
    answer: "Có. Bạn có thể nâng cấp bất kỳ lúc nào để phù hợp với quy mô phát triển của doanh nghiệp.",
  },
  {
    question: "Thời gian hoàn thành trung bình là bao lâu?",
    answer: "Landing Page thường hoàn thành trong 3–5 ngày làm việc, Website tiêu chuẩn từ 7–15 ngày tuỳ khối lượng nội dung.",
  },
  {
    question: "Có chi phí phát sinh sau bàn giao không?",
    answer: "Chi phí được thống nhất trước khi triển khai; các hạng mục phát sinh ngoài phạm vi sẽ được báo giá riêng và chỉ thực hiện khi bạn đồng ý.",
  },
  {
    question: "Tôi có cần tự chuẩn bị nội dung và hình ảnh không?",
    answer: "Không bắt buộc. Đội ngũ hỗ trợ biên tập nội dung và tư vấn hình ảnh phù hợp với định hướng thương hiệu của bạn.",
  },
  {
    question: "Website sau bàn giao có dễ quản lý và cập nhật không?",
    answer: "Có. Từ gói Tiêu Chuẩn trở lên đều đi kèm trang quản trị trực quan, không cần biết lập trình.",
  },
  {
    question: "Website có chuẩn SEO và hiển thị tốt trên điện thoại không?",
    answer: "Có. Toàn bộ sản phẩm bàn giao đều đạt chuẩn responsive và tối ưu SEO kỹ thuật cơ bản.",
  },
  {
    question: "Chính sách bảo hành và hỗ trợ sau bàn giao thế nào?",
    answer: "Mỗi gói dịch vụ đi kèm thời gian bảo hành riêng, bao gồm sửa lỗi kỹ thuật phát sinh không do người dùng gây ra.",
  },
  {
    question: "Tôi có nhận được mã nguồn (source code) sau khi bàn giao không?",
    answer: "Có. Toàn bộ mã nguồn và hướng dẫn triển khai được bàn giao đầy đủ khi hoàn tất dự án.",
  },
];
