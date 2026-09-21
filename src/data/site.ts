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
    "text": "Website chuyên nghiệp thể hiện đúng nhận diện thương hiệu, tải nhanh, chuẩn SEO và hiển thị mượt trên mọi thiết bị.",
    "items": [
      "Giao diện theo nhận diện thương hiệu",
      "Nền tảng SEO kỹ thuật ngay từ đầu",
      "Cấu trúc linh hoạt, dễ mở rộng và quản trị"
    ]
  },
  {
    "icon": "rocket",
    "title": "Thiết Kế Landing Page",
    "href": "/thiet-ke-landing-page",
    "text": "Landing Page tập trung vào một mục tiêu duy nhất, bám sát thông điệp chiến dịch để nâng cao tỷ lệ chuyển đổi.",
    "items": [
      "Nội dung dẫn dắt theo hành trình khách hàng",
      "CTA và biểu mẫu rõ ràng, đặt đúng thời điểm",
      "Trải nghiệm mượt mà trên di động"
    ]
  },
  {
    "icon": "shield",
    "title": "Tối Ưu & Chăm Sóc Website",
    "href": "/dich-vu",
    "text": "Cải thiện tốc độ, bảo mật và cập nhật nội dung định kỳ để website luôn vận hành ổn định.",
    "items": [
      "Đánh giá hiệu năng thực tế",
      "Rà soát SEO kỹ thuật và bảo mật",
      "Chăm sóc, cập nhật theo phạm vi thỏa thuận"
    ]
  },
  {
    "icon": "code",
    "title": "Lập Trình Web App",
    "href": "/dich-vu",
    "text": "Phát triển ứng dụng web, hệ thống quản lý và dashboard, số hóa quy trình theo yêu cầu riêng của doanh nghiệp.",
    "items": [
      "Giao diện quản trị và phân quyền",
      "Số hóa quy trình vận hành",
      "Kiến trúc sẵn sàng mở rộng"
    ]
  }
];

export const pricingPlans: PricingPlan[] = [
  {
    "name": "Cơ Bản",
    "desc": "Landing Page hoàn chỉnh cho cá nhân và cửa hàng nhỏ: hiển thị tốt trên di động, sẵn sàng thu hút khách hàng.",
    "price": "449.000đ",
    "duration": "3-5 ngày",
    "items": [
      "01 trang bán hàng (Landing Page)",
      "Chuẩn hiển thị di động (Responsive)",
      "Biểu mẫu đăng ký và nút CTA tối ưu",
      "Bảo hành 4 tháng",
      "Hỗ trợ cấu hình Tên miền, Hosting & SSL"
    ]
  },
  {
    "name": "Tiêu Chuẩn",
    "desc": "Website giới thiệu doanh nghiệp chuyên nghiệp, chuẩn SEO, dễ tự quản lý nội dung.",
    "price": "1.899.000đ",
    "duration": "7-15 ngày",
    "hot": true,
    "items": [
      "Trang giới thiệu, dịch vụ chi tiết",
      "Hệ thống quản trị nội dung (Admin)",
      "Quản lý dự án, bài viết & tin tức",
      "Bảo hành 12 tháng",
      "Hỗ trợ cấu hình Tên miền, Hosting & SSL"
    ]
  },
  {
    "name": "Cao Cấp",
    "desc": "Website bán hàng đa chức năng với giỏ hàng, đặt hàng và quản lý sản phẩm đầy đủ.",
    "price": "6.000.000đ",
    "duration": "Theo phạm vi",
    "items": [
      "Quản lý sản phẩm và danh mục",
      "Giỏ hàng, đặt hàng trực tuyến",
      "Quản lý đơn hàng & khách hàng",
      "Bảo hành 12 tháng",
      "Hỗ trợ cấu hình Tên miền, Hosting & SSL"
    ]
  },
  {
    "name": "Theo Yêu Cầu",
    "desc": "Web app và hệ thống quản trị thiết kế riêng, triển khai theo từng giai đoạn.",
    "price": "Báo giá riêng",
    "duration": "Theo giai đoạn",
    "items": [
      "Phân tích nghiệp vụ & giải pháp riêng",
      "Quản trị tài khoản & phân quyền",
      "Dashboard thống kê & xử lý dữ liệu",
      "Bảo hành 12 tháng",
      "Hỗ trợ vận hành & bảo mật chuyên sâu"
    ]
  }
];

export const faqs: [question: string, answer: string][] = [
  [
    "Tôi có thể nâng cấp gói dịch vụ sau này không?",
    "Hoàn toàn được. Khi doanh nghiệp phát triển, bạn có thể nâng cấp lên gói phù hợp hơn vào bất kỳ thời điểm nào."
  ],
  [
    "Thời gian hoàn thành trung bình là bao lâu?",
    "Tùy độ phức tạp của dự án. Gói Cơ Bản thường mất 3–5 ngày, gói Tiêu Chuẩn từ 7–15 ngày; với các dự án lớn hơn, chúng tôi sẽ đề xuất lộ trình cụ thể sau khi khảo sát nhu cầu."
  ],
  [
    "Có chi phí phát sinh sau bàn giao không?",
    "Không. Chi phí thiết kế là trọn gói và được báo rõ trước khi bắt đầu. Bạn chỉ thanh toán riêng phí tên miền và hosting cho nhà cung cấp — chúng tôi hỗ trợ cài đặt, cấu hình miễn phí. Ngoài ra không có chi phí ẩn nào khác."
  ],
  [
    "Tôi có cần tự chuẩn bị nội dung và hình ảnh không?",
    "Nếu đã có sẵn, chúng tôi sẽ tối ưu và đưa vào website. Nếu chưa, đội ngũ sẽ hỗ trợ biên soạn nội dung chuẩn SEO và tìm hình ảnh phù hợp với thương hiệu của bạn."
  ],
  [
    "Website sau bàn giao có dễ quản lý và cập nhật không?",
    "Có. Với gói Tiêu Chuẩn và Cao Cấp, bạn được trang quản trị (Admin Dashboard) trực quan để tự cập nhật nội dung, bài viết hoặc sản phẩm mà không cần biết lập trình."
  ],
  [
    "Website có chuẩn SEO và hiển thị tốt trên điện thoại không?",
    "Có. Mọi website đều được tối ưu responsive cho điện thoại, máy tính bảng và máy tính, cùng nền tảng SEO on-page ở mức mã nguồn để website dễ được Google thu thập và xếp hạng."
  ],
  [
    "Chính sách bảo hành và hỗ trợ sau bàn giao như thế nào?",
    "Tùy gói dịch vụ, thời gian bảo hành từ 4 đến 12 tháng. Trong thời gian này, chúng tôi hỗ trợ sửa lỗi kỹ thuật phát sinh và hướng dẫn vận hành miễn phí."
  ],
  [
    "Tôi có nhận được mã nguồn (source code) sau khi bàn giao không?",
    "Có. Sau khi nghiệm thu, chúng tôi bàn giao 100% mã nguồn cùng tài khoản quản trị. Bạn toàn quyền sở hữu và có thể nâng cấp, mở rộng hệ thống về sau."
  ]
];

export const processSteps: [icon: IconName, title: string, text: string][] = [
  ["search", "Nghiên cứu", "Lắng nghe nhu cầu, phân tích thị trường và đối thủ."],
  ["layout", "Chiến lược", "Xây dựng cấu trúc trang và luồng trải nghiệm người dùng."],
  ["palette", "Thiết kế", "Thiết kế giao diện mang dấu ấn riêng, hiện đại và nhất quán."],
  ["code", "Bàn giao", "Lập trình, kiểm thử kỹ lưỡng và bàn giao hoàn chỉnh."],
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
  "Giao diện độc quyền, chuẩn SEO.",
];

export const heroBanners = ["/images/home-banner1.webp", "/images/home-banner2.webp", "/images/home-banner3.webp"];

// Primary contact details: change them here and every page follows.
export const PHONE = "0365614597";
export const PHONE_DISPLAY = "0365 614 597"; // spaced, for text
export const PHONE_DOTTED = "0365.614.597"; // dotted, for the CTA card
export const PHONE_INTL = "+84365614597";
export const EMAIL = "thanhtran.kma@gmail.com";
export const ADDRESS = "Hải Phòng, Việt Nam";
export const ZALO_URL = `https://zalo.me/${PHONE}`;

// Facebook / Instagram / TikTok are hidden for now. Set to true to bring them back everywhere.
export const SHOW_SOCIALS = false;
// Old handles kept only so the links can be restored; update them before re-enabling SHOW_SOCIALS.
export const FACEBOOK_URL = "https://web.facebook.com/profile.php?id=61591410136278";
export const TIKTOK_URL = "https://www.tiktok.com/@thietkeweblandingpage";
export const INSTAGRAM_URL = "https://www.instagram.com/weblandingthietke/";

export const facebookPath =
  "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";
