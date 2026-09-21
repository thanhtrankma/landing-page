export type Project = {
  title: string;
  category: string;
  img: string;
  code: string;
  demoUrl?: string;
  sample?: boolean;
};

export const categories = [
  { id: "all", label: "Tất cả" },
  { id: "ban-hang", label: "Bán hàng" },
  { id: "cong-ty", label: "Công ty" },
  { id: "bat-dong-san", label: "Bất động sản" },
  { id: "noi-that", label: "Nội thất" },
  { id: "khach-san", label: "Khách sạn" },
  { id: "nha-hang", label: "Nhà hàng" },
  { id: "du-lich", label: "Du lịch" },
  { id: "oto-xemay", label: "Ô tô - Xe máy" },
  { id: "giao-duc", label: "Giáo dục" },
  { id: "tin-tuc", label: "Tin tức" },
  { id: "landing-page", label: "Landing Page" },
];

import type { ProjectRecord } from "@/lib/content";

export const projectsToCards = (list: ProjectRecord[]): Project[] =>
  [...list]
    .sort((a, b) => (a.homeOrder ?? 0) - (b.homeOrder ?? 0))
    .map((p) => ({
      title: p.title,
      category: p.category,
      img: p.img,
      code: p.code,
      ...(p.demoUrl ? { demoUrl: p.demoUrl } : {}),
      ...(p.sample ? { sample: true } : {}),
    }));
