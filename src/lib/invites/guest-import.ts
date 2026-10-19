// Reads a guest list file in the browser (Excel .xlsx, .csv or plain text) into rows for "Thêm khách".
// A header row is recognised by its titles (Tên / Nhóm / Lời mời / Số người, with or without accents);
// without one, the first column is the guest's name.

export type ImportRow = { name: string; group: string; greeting: string; maxPeople: number | null };

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const COLUMNS: [keyof ImportRow, RegExp][] = [
  ["name", /^(ho )?(va )?ten( khach( moi)?| hien thi| tren thiep)?$|^khach( moi)?$|^danh xung$|^name$|^guest( name)?$/],
  ["group", /^nhom|^ban( so)?$|^group$|^table$/],
  ["greeting", /^loi (moi|chao)|^greeting$|^message$/],
  ["maxPeople", /^so (nguoi|luong|khach)|^toi da|^max/],
];

type Cell = string | number | boolean | Date | null | undefined;

function toRows(table: Cell[][]): ImportRow[] {
  const cells = table.map((r) => r.map((c) => (c == null ? "" : c instanceof Date ? c.toLocaleDateString("vi-VN") : String(c)).replace(/\s+/g, " ").trim()));
  const rows = cells.filter((r) => r.some(Boolean));
  if (!rows.length) return [];
  const map: Partial<Record<keyof ImportRow, number>> = {};
  rows[0].forEach((title, i) => {
    const hit = COLUMNS.find(([key, re]) => map[key] === undefined && re.test(fold(title)));
    if (hit) map[hit[0]] = i;
  });
  const hasHeader = map.name !== undefined;
  const nameAt = map.name ?? 0;
  return (hasHeader ? rows.slice(1) : rows)
    .map((r) => {
      const max = Number.parseInt(r[map.maxPeople ?? -1] ?? "", 10);
      return {
        name: (r[nameAt] ?? "").slice(0, 80),
        group: hasHeader ? (r[map.group ?? -1] ?? "").slice(0, 60) : "",
        greeting: hasHeader ? (r[map.greeting ?? -1] ?? "").slice(0, 200) : "",
        maxPeople: Number.isFinite(max) && max > 0 ? Math.min(max, 20) : null,
      };
    })
    .filter((r) => r.name);
}

/** RFC 4180-ish CSV with the delimiter guessed from the first line (Excel in Vietnamese locales uses ";"). */
function parseCsv(text: string): string[][] {
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  const delim = [",", ";", "\t"].map((d) => [d, first.split(d).length] as const).sort((a, b) => b[1] - a[1])[0][0];
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      out.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  out.push(row);
  return out;
}

export const GUEST_FILE_ACCEPT = ".xlsx,.csv,.txt,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function readGuestFile(file: File): Promise<ImportRow[]> {
  const ext = file.name.toLowerCase().split(".").pop();
  if (file.size > 5 * 1024 * 1024) throw new Error("File quá lớn (tối đa 5MB).");
  if (ext === "xls") throw new Error("Hãy lưu file Excel dạng .xlsx (File → Save As → Excel Workbook) rồi tải lại.");
  if (ext === "xlsx") {
    const { readSheet } = await import("read-excel-file/browser");
    return toRows((await readSheet(file)) as Cell[][]);
  }
  const text = (await file.text()).replace(/^﻿/, "");
  return toRows(ext === "csv" ? parseCsv(text) : text.split(/\r?\n/).map((l) => (l.includes("\t") || l.includes(";") ? parseCsv(l)[0] : [l])));
}

/** A ready-to-fill sample (opens in Excel with Vietnamese accents thanks to the BOM). */
export function guestTemplateCsv() {
  const lines = ["Tên khách,Nhóm,Lời mời riêng,Số người", "Anh Trọng,Bạn chú rể,,2", "Gia đình chú Năm,Họ hàng nhà gái,Tới dự bữa cơm thân mật cùng gia đình,4", "Chị Lan & anh Hùng,Đồng nghiệp,,"];
  return new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
}
