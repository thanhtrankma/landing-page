// Small form helpers shared by server actions (no external validation library in this project).
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
export const flag = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
export const int = (fd: FormData, key: string, fallback = 0) => {
  const n = Number.parseInt(String(fd.get(key) ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
};

export type FormState = { ok?: boolean; error?: string; message?: string } | undefined;
