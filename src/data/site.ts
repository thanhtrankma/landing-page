export type Service = {
  icon: IconName;
  title: string;
  href: string;
  text: string;
  items: string[];
};

export type PricingPlan = {
  name: string;
  desc: string;
  price: string;
  duration: string;
  hot?: boolean;
  items: string[];
};

export type IconName =
  | "arrow" | "check" | "building" | "rocket" | "palette" | "search" | "layout"
  | "code" | "shield" | "chart" | "cloud" | "mail" | "phone" | "menu";

export const services: Service[] = [
  {
    "icon": "building",
    "title": "Thiết Kế Website",
    "href": "/thiet-ke-website",
    "text": "Xây dựng website chuyên nghiệp, tối ưu công cụ tìm kiếm, tốc độ và khả năng hiển thị trên mọi thiết bị.",
    "items": [
      "Giao diện theo nhận diện thương hiệu",
      "Nền tảng SEO kỹ thuật",
      "Cấu trúc dễ mở rộng và quản trị"
    ]
  },
  {
    "icon": "rocket",
    "title": "Thiết Kế Landing Page",
    "href": "/thiet-ke-landing-page",
    "text": "Thiết kế Landing Page tập trung vào một mục tiêu chuyển đổi và phù hợp với thông điệp chiến dịch.",
    "items": [
      "Cấu trúc nội dung theo hành trình khách hàng",
      "CTA và biểu mẫu rõ ràng",
      "Tối ưu trải nghiệm di động"
    ]
  },
  {
    "icon": "shield",
    "title": "Tối Ưu & Chăm Sóc Website",
    "href": "/dich-vu",
    "text": "Cải thiện tốc độ, bảo mật và cập nhật nội dung định kỳ để hệ thống vận hành ổn định.",
    "items": [
      "Đánh giá hiệu năng thực tế",
      "Rà soát SEO kỹ thuật và bảo mật",
      "Chăm sóc, cập nhật theo phạm vi"
    ]
  },
  {
    "icon": "code",
    "title": "Lập Trình Web App",
    "href": "/dich-vu",
    "text": "Phát triển ứng dụng web, hệ thống quản lý, dashboard và số hóa quy trình theo yêu cầu riêng.",
    "items": [
      "Giao diện quản trị và phân quyền",
      "Số hóa quy trình vận hành",
      "Kiến trúc có khả năng mở rộng"
    ]
  }
];

export const pricingPlans: PricingPlan[] = [
  {
    "name": "Cơ Bản",
    "desc": "Landing Page hoàn chỉnh, tối ưu hiển thị di động và chuyển đổi khách hàng.",
    "price": "449.000đ",
    "duration": "3-5 ngày",
    "items": [
      "01 trang bán hàng (Landing Page)",
      "Chuẩn hiển thị di động (Responsive)",
      "Mẫu đăng ký và nút CTA tối ưu",
      "Bảo hành 4 tháng",
      "Hỗ trợ cấu hình Tên miền, Hosting & SSL"
    ]
  },
  {
    "name": "Tiêu Chuẩn",
    "desc": "Website giới thiệu doanh nghiệp, dịch vụ chuyên nghiệp, chuẩn SEO và dễ quản lý.",
    "price": "1.899.000đ",
    "duration": "7-15 ngày",
    "hot": true,
    "items": [
      "Các trang giới thiệu, dịch vụ chi tiết",
      "Hệ thống quản trị nội dung (Admin)",
      "Quản lý dự án, bài viết & tin tức",
      "Bảo hành 12 tháng",
      "Hỗ trợ cấu hình Tên miền, Hosting & SSL"
    ]
  },
  {
    "name": "Cao Cấp",
    "desc": "Website bán hàng đa chức năng, đầy đủ giỏ hàng, đặt hàng và quản lý sản phẩm.",
    "price": "6.000.000đ",
    "duration": "Theo phạm vi",
    "items": [
      "Quản lý sản phẩm và danh mục",
      "Hệ thống giỏ hàng, đặt hàng trực tuyến",
      "Quản lý đơn hàng & Khách hàng",
      "Bảo hành 12 tháng",
      "Hỗ trợ cấu hình Tên miền, Hosting & SSL"
    ]
  },
  {
    "name": "Theo Yêu Cầu",
    "desc": "Web App Custom, hệ thống quản trị, vận hành số hóa thiết kế riêng theo giai đoạn.",
    "price": "Báo giá riêng",
    "duration": "Theo giai đoạn",
    "items": [
      "Phân tích nghiệp vụ & Giải pháp riêng",
      "Quản trị tài khoản & Phân quyền",
      "Dashboard thống kê & Xử lý dữ liệu",
      "Bảo hành 12 tháng",
      "Hỗ trợ vận hành & bảo mật chuyên sâu"
    ]
  }
];

export const faqs: [question: string, answer: string][] = [
  [
    "Tôi có thể nâng cấp gói dịch vụ sau này không?",
    "Có. Bạn có thể nâng cấp bất kỳ lúc nào để phù hợp với quy mô phát triển của doanh nghiệp."
  ],
  [
    "Thời gian hoàn thành trung bình là bao lâu?",
    "Thời gian hoàn thành phụ thuộc vào độ phức tạp của dự án. Thông thường, gói Cơ Bản từ 3-5 ngày, gói Tiêu Chuẩn từ 7-15 ngày."
  ],
  [
    "Có chi phí phát sinh sau bàn giao không?",
    "Không. Chi phí thiết kế là trọn gói và được thông báo minh bạch trước khi thực hiện. Phí mua tên miền và hosting sẽ do khách hàng tự chi trả cho nhà cung cấp (chúng tôi hỗ trợ cài đặt & cấu hình miễn phí), ngoài ra không có bất kỳ chi phí ẩn nào khác."
  ],
  [
    "Tôi có cần tự chuẩn bị nội dung và hình ảnh không?",
    "Nếu bạn đã có sẵn nội dung và hình ảnh, chúng tôi sẽ tối ưu hóa và đưa vào web. Nếu chưa, chúng tôi có dịch vụ hỗ trợ biên soạn nội dung chuẩn SEO và tìm kiếm hình ảnh phù hợp với thương hiệu của bạn."
  ],
  [
    "Website sau bàn giao có dễ quản lý và cập nhật không?",
    "Có. Đối với các gói Tiêu Chuẩn và Cao Cấp, chúng tôi cung cấp trang quản trị (Admin Dashboard) trực quan, giúp bạn dễ dàng cập nhật nội dung, bài viết hoặc sản phẩm mà không cần biết lập trình."
  ],
  [
    "Website có chuẩn SEO và hiển thị tốt trên điện thoại không?",
    "Tất cả website chúng tôi thiết kế đều được tối ưu hóa responsive 100% hiển thị hoàn hảo trên di động, máy tính bảng và máy tính. Đồng thời, mã nguồn được tối ưu SEO on-page để trang web dễ dàng đạt thứ hạng cao trên Google."
  ],
  [
    "Chính sách bảo hành và hỗ trợ sau bàn giao thế nào?",
    "Tùy theo gói dịch vụ, bạn sẽ nhận được chế độ bảo hành từ 4 đến 12 tháng. Chúng tôi cam kết hỗ trợ sửa lỗi kỹ thuật phát sinh và hướng dẫn vận hành miễn phí trong suốt thời gian bảo hành."
  ],
  [
    "Tôi có nhận được mã nguồn (source code) sau khi bàn giao không?",
    "Có. Sau khi dự án hoàn thành và nghiệm thu, chúng tôi bàn giao 100% mã nguồn (Source Code) và tài khoản quản trị cho bạn. Bạn toàn quyền sở hữu và có thể tự do nâng cấp, mở rộng hệ thống sau này."
  ]
];

export const processSteps: [icon: IconName, title: string, text: string][] = [
  ["search", "Nghiên cứu", "Lắng nghe nhu cầu và phân tích thị trường."],
  ["layout", "Chiến lược", "Xây dựng cấu trúc và luồng trải nghiệm."],
  ["palette", "Thiết kế", "Thiết kế nhận diện và tương tác hiện đại."],
  ["code", "Bàn giao", "Lập trình, kiểm thử và bàn giao hoàn thiện."],
];

export const navLinks: [href: string, label: string][] = [
  ["/", "Trang chủ"],
  ["/dich-vu", "Dịch vụ"],
  ["/du-an", "Dự án"],
  ["/bang-gia", "Bảng giá"],
  ["/tin-tuc", "Tin tức"],
  ["/lien-he", "Liên hệ"],
];

export const heroTexts = [
  "Landing Page theo yêu cầu.",
  "Website tối ưu chuyển đổi.",
  "Giao diện độc quyền chuẩn SEO.",
];

export const heroBanners = ["/images/home-banner1.webp", "/images/home-banner2.webp", "/images/home-banner3.webp"];

export const ZALO_URL = "https://zalo.me/0971424792";
export const FACEBOOK_URL = "https://web.facebook.com/profile.php?id=61591410136278";
export const TIKTOK_URL = "https://www.tiktok.com/@thietkeweblandingpage";
export const INSTAGRAM_URL = "https://www.instagram.com/weblandingthietke/";

export const facebookPath =
  "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";
