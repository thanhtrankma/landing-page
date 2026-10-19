"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/cards/ui";
import type { Guest, GuestGroup, Rsvp, RsvpStats } from "@/lib/invites/guests";
import { GUEST_FILE_ACCEPT, guestTemplateCsv, readGuestFile, type ImportRow } from "@/lib/invites/guest-import";
import "./guests.css";

// Guest list & RSVP dashboard for one invitation: groups, personal links, answers and totals.

type Data = { guests: Guest[]; groups: GuestGroup[]; rsvps: Rsvp[]; stats: RsvpStats };
type Props = { inviteId: string; slug: string; status: "draft" | "published"; title: string; questions: string[] };

const STATUS: Record<string, [string, string]> = { yes: ["Sẽ đến", "yes"], no: ["Không đến", "no"], maybe: ["Chưa chắc", "maybe"] };
const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const TOOL = "/cong-cu/thiep-cuoi-online";

export default function GuestManager({ inviteId, slug, status, title, questions }: Props) {
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<"guests" | "rsvps">("guests");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState<string | null>(null);
  const [imported, setImported] = useState<{ file: string; rows: ImportRow[]; skipDupes: boolean } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [toast, setToast] = useState<{ m: string; err?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const call = useCallback(
    async (body?: Record<string, unknown>) => {
      const res = await fetch(`/api/invites/${inviteId}/guests`, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Có lỗi xảy ra, vui lòng thử lại.");
      setData(json as Data);
      return json as Data;
    },
    [inviteId],
  );

  useEffect(() => {
    let live = true;
    fetch(`/api/invites/${inviteId}/guests`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Không tải được danh sách khách.");
        if (live) setData(json as Data);
      })
      .catch((e: Error) => live && setToast({ m: e.message, err: true }));
    return () => {
      live = false;
    };
  }, [inviteId]);

  const act = async (body: Record<string, unknown>, done?: string) => {
    setBusy(true);
    try {
      await call(body);
      if (done) setToast({ m: done });
      return true;
    } catch (e) {
      setToast({ m: (e as Error).message, err: true });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const groupId = filter !== "all" && filter !== "none" ? filter : null;
  const shown = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.guests;
    if (filter === "none") return data.guests.filter((g) => !g.groupId);
    return data.guests.filter((g) => g.groupId === filter);
  }, [data, filter]);

  const linkOf = (g: Guest) => `${origin}/thiep/${slug}?k=${g.code}`;
  const copy = async (text: string, msg = "Đã sao chép link.") => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ m: msg });
    } catch {
      setToast({ m: "Không sao chép được.", err: true });
    }
  };
  const shareGuest = (g: Guest) => {
    const url = linkOf(g);
    if ("share" in navigator) navigator.share({ title: `Thiệp mời ${g.name}`, text: `${title} – kính mời ${g.name}`, url }).catch(() => {});
    else void copy(url);
  };

  const download = (blob: Blob, filename: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const rows = await readGuestFile(file);
      if (!rows.length) throw new Error("Không tìm thấy tên khách nào trong file.");
      setImported({ file: file.name, rows: rows.slice(0, 500), skipDupes: true });
    } catch (e) {
      setToast({ m: (e as Error).message || "Không đọc được file.", err: true });
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const exportCsv = () => {
    if (!data) return;
    const groupName = (id: string | null) => data.groups.find((g) => g.id === id)?.name ?? "";
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["Tên khách", "Nhóm", "Trạng thái", "Số người", ...questions, "Link riêng", "Phản hồi lúc"];
    const rows = data.guests.map((g) => [g.name, groupName(g.groupId), g.rsvpStatus ? STATUS[g.rsvpStatus][0] : "Chưa trả lời", g.rsvpStatus === "yes" ? g.rsvpPeople ?? 1 : "", ...questions.map((q) => g.rsvpAnswers[q] ?? ""), linkOf(g), g.rsvpAt ? fmt.format(new Date(g.rsvpAt)) : ""]);
    const anon = data.rsvps.filter((r) => !r.guestId).map((r) => [r.name, "(Link chung)", STATUS[r.status][0], r.status === "yes" ? r.people : "", ...questions.map((q) => r.answers[q] ?? ""), "", fmt.format(new Date(r.createdAt))]);
    download(new Blob(["\uFEFF" + [header, ...rows, ...anon].map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }), "khach-moi.csv");
  };

  const toggleSel = (id: string) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  if (!data) return <p className="gm-loading">Đang tải danh sách khách…</p>;
  const s = data.stats;
  const yesAnswers = [...data.guests.filter((g) => g.rsvpStatus === "yes").map((g) => g.rsvpAnswers), ...data.rsvps.filter((r) => !r.guestId && r.status === "yes").map((r) => r.answers)];

  return (
    <div className="gm">
      {status === "draft" && (
        <div className="ib-note warn">
          Thiệp chưa xuất bản nên khách chưa mở được link. Bạn vẫn có thể chuẩn bị danh sách trước. <Link href={`${TOOL}/sua/${inviteId}?publish=1`}>Xuất bản thiệp</Link>
        </div>
      )}

      <section className="gm-stats" aria-label="Thống kê xác nhận tham dự">
        <div className="gm-stat big">
          <span>RSVP tự gom về một nơi</span>
          <b>{s.people}</b>
          <small>người dự tiệc đã ghi nhận</small>
          <div className="gm-bar" aria-hidden="true">
            <i style={{ width: `${s.answerRate}%` }} />
          </div>
          <small>{s.answerRate}% khách đã trả lời</small>
        </div>
        <div className="gm-stat yes"><b>{s.yes}</b><span>Có đến</span></div>
        <div className="gm-stat no"><b>{s.no}</b><span>Không đến</span></div>
        <div className="gm-stat"><b>{s.pending}</b><span>Chưa trả lời</span></div>
        <div className="gm-stat"><b>{s.guests}</b><span>Khách trong danh sách</span></div>
        {questions.map((q) => {
          const counts = new Map<string, number>();
          for (const a of yesAnswers) if (a[q]) counts.set(a[q], (counts.get(a[q]) ?? 0) + 1);
          if (!counts.size) return null;
          return (
            <div key={q} className="gm-stat q">
              <span>{q}</span>
              <p>{[...counts.entries()].map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
            </div>
          );
        })}
      </section>

      <div className="gm-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "guests"} className={tab === "guests" ? "on" : ""} onClick={() => setTab("guests")}>
          Danh sách khách ({data.guests.length})
        </button>
        <button type="button" role="tab" aria-selected={tab === "rsvps"} className={tab === "rsvps" ? "on" : ""} onClick={() => setTab("rsvps")}>
          Tất cả phản hồi ({data.rsvps.length})
        </button>
        <button type="button" className="ce-btn sm gm-export" onClick={exportCsv}>
          Xuất Excel (CSV)
        </button>
      </div>

      {tab === "guests" ? (
        <>
          <form
            className="gm-add"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await act({ action: "add", guests: [{ name, groupId }] }, "Đã thêm khách.")) setName("");
            }}
          >
            <input type="text" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Tên khách, VD: Anh Tuấn & Chị Hà" aria-label="Tên khách" />
            <button type="submit" className="ce-btn primary" disabled={busy || !name.trim()}>
              Thêm khách
            </button>
            <button type="button" className="ce-btn" onClick={() => setBulk("")}>
              Thêm nhiều
            </button>
            <button type="button" className="ce-btn" onClick={() => fileInput.current?.click()}>
              Tải file danh sách
            </button>
            <input ref={fileInput} type="file" accept={GUEST_FILE_ACCEPT} hidden onChange={(e) => void onFile(e.target.files?.[0])} />
          </form>

          <div className="gm-groups">
            {[["all", `Tất cả (${data.guests.length})`], ...data.groups.map((g) => [g.id, `${g.name} (${data.guests.filter((x) => x.groupId === g.id).length})`]), ["none", `Chưa có nhóm (${data.guests.filter((x) => !x.groupId).length})`]].map(([id, label]) => (
              <button key={id} type="button" className={filter === id ? "on" : ""} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
            <button
              type="button"
              className="add"
              onClick={async () => {
                const n = prompt("Tên nhóm (VD: Gia đình nhà trai, Bàn 5, Bạn đại học):");
                if (n?.trim()) await act({ action: "group-create", name: n }, "Đã tạo nhóm.");
              }}
            >
              + Nhóm
            </button>
            {groupId && (
              <>
                <button
                  type="button"
                  className="ghost"
                  onClick={async () => {
                    const g = data.groups.find((x) => x.id === groupId);
                    const n = prompt("Đổi tên nhóm:", g?.name);
                    if (n?.trim()) await act({ action: "group-rename", groupId, name: n });
                  }}
                >
                  Đổi tên nhóm
                </button>
                <button
                  type="button"
                  className="ghost danger"
                  onClick={async () => {
                    if (confirm("Xoá nhóm này? Khách trong nhóm vẫn được giữ lại.")) {
                      await act({ action: "group-delete", groupId }, "Đã xoá nhóm.");
                      setFilter("all");
                    }
                  }}
                >
                  Xoá nhóm
                </button>
              </>
            )}
          </div>

          {selected.size > 0 && (
            <div className="gm-bulk">
              <b>Đã chọn {selected.size}</b>
              <select
                defaultValue=""
                onChange={async (e) => {
                  const v = e.target.value;
                  e.target.value = "";
                  if (!v) return;
                  await act({ action: "move", ids: [...selected], groupId: v === "none" ? null : v }, "Đã chuyển nhóm.");
                  setSelected(new Set());
                }}
                aria-label="Chuyển sang nhóm"
              >
                <option value="">Chuyển sang nhóm…</option>
                {data.groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
                <option value="none">Bỏ khỏi nhóm</option>
              </select>
              <button
                type="button"
                className="ce-btn sm ghost danger"
                onClick={async () => {
                  if (!confirm(`Xoá ${selected.size} khách? Link riêng của họ sẽ không dùng được nữa.`)) return;
                  await act({ action: "delete", ids: [...selected] }, "Đã xoá khách.");
                  setSelected(new Set());
                }}
              >
                Xoá
              </button>
              <button type="button" className="ce-btn sm ghost" onClick={() => setSelected(new Set())}>
                Bỏ chọn
              </button>
            </div>
          )}

          {shown.length ? (
            <ul className="gm-list">
              {shown.map((g) => (
                <li key={g.id} className={selected.has(g.id) ? "sel" : ""}>
                  <input type="checkbox" checked={selected.has(g.id)} onChange={() => toggleSel(g.id)} aria-label={`Chọn ${g.name}`} />
                  <div className="gm-who">
                    <a className="gm-name" href={linkOf(g)} target="_blank" rel="noopener noreferrer" title="Mở thiệp của khách này">
                      {g.name}
                    </a>
                    <small>
                      {data.groups.find((x) => x.id === g.groupId)?.name ?? "Chưa có nhóm"}
                      {g.openedAt ? " · Đã mở thiệp" : ""}
                      {g.maxPeople ? ` · Tối đa ${g.maxPeople} người` : ""}
                    </small>
                    {g.greeting && <small className="gm-greet">“{g.greeting}”</small>}
                    {Object.keys(g.rsvpAnswers).length > 0 && <small>{Object.entries(g.rsvpAnswers).map(([k, v]) => `${k} ${v}`).join(" · ")}</small>}
                  </div>
                  <span className={`gm-chip ${g.rsvpStatus ?? "none"}`}>
                    {g.rsvpStatus ? STATUS[g.rsvpStatus][0] : "Chưa trả lời"}
                    {g.rsvpStatus === "yes" && g.rsvpPeople ? ` · ${g.rsvpPeople}` : ""}
                  </span>
                  <div className="gm-actions">
                    <button type="button" className="ce-btn sm" onClick={() => copy(linkOf(g))}>
                      Sao chép link
                    </button>
                    <button type="button" className="ce-btn sm ghost" onClick={() => shareGuest(g)}>
                      Gửi
                    </button>
                    <button type="button" className="ce-btn sm ghost" onClick={() => setEditing(g)}>
                      Sửa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="gm-empty">Chưa có khách nào {filter === "all" ? "" : "trong nhóm này"}. Thêm khách để mỗi người có một link thiệp riêng ghi tên họ.</p>
          )}
        </>
      ) : data.rsvps.length ? (
        <ul className="gm-list">
          {data.rsvps.map((r) => (
            <li key={r.id}>
              <div className="gm-who">
                <b>{r.name}</b>
                <small>
                  {r.guestId ? "Từ link riêng" : "Từ link chung"} · {fmt.format(new Date(r.createdAt))}
                </small>
                {Object.keys(r.answers).length > 0 && <small>{Object.entries(r.answers).map(([k, v]) => `${k} ${v}`).join(" · ")}</small>}
              </div>
              <span className={`gm-chip ${r.status}`}>
                {STATUS[r.status][0]}
                {r.status === "yes" ? ` · ${r.people}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="gm-empty">Chưa có ai xác nhận tham dự.</p>
      )}

      {imported && (() => {
        const existing = new Set(data.guests.map((g) => g.name.trim().toLowerCase()));
        const dupes = imported.rows.filter((r) => existing.has(r.name.trim().toLowerCase())).length;
        const rows = imported.skipDupes ? imported.rows.filter((r) => !existing.has(r.name.trim().toLowerCase())) : imported.rows;
        const newGroups = [...new Set(rows.map((r) => r.group).filter(Boolean))].filter((n) => !data.groups.some((g) => g.name.trim().toLowerCase() === n.toLowerCase()));
        return (
          <Modal title="Thêm khách từ file" onClose={() => setImported(null)} wide>
            <p>
              Đọc được <b>{imported.rows.length}</b> khách từ <b>{imported.file}</b>. Mỗi người sẽ có một link thiệp riêng ghi đúng tên họ.
              {newGroups.length > 0 && ` Sẽ tạo thêm ${newGroups.length} nhóm: ${newGroups.join(", ")}.`}
            </p>
            {dupes > 0 && (
              <label className="gm-check">
                <input type="checkbox" checked={imported.skipDupes} onChange={(e) => setImported({ ...imported, skipDupes: e.target.checked })} />
                Bỏ qua {dupes} tên đã có trong danh sách
              </label>
            )}
            <div className="gm-preview">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên trên thiệp</th>
                    <th>Nhóm</th>
                    <th>Lời mời riêng</th>
                    <th>Số người</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.name}</td>
                      <td>{r.group || (groupId ? data.groups.find((g) => g.id === groupId)?.name : "")}</td>
                      <td>{r.greeting}</td>
                      <td>{r.maxPeople ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 100 && <p className="gm-more">… và {rows.length - 100} khách nữa</p>}
            </div>
            <div className="ce-row between">
              <button type="button" className="ce-btn ghost" onClick={() => download(guestTemplateCsv(), "mau-danh-sach-khach.csv")}>
                Tải file mẫu
              </button>
              <button
                type="button"
                className="ce-btn primary"
                disabled={busy || !rows.length}
                onClick={async () => {
                  const guests = rows.map((r) => ({ name: r.name, groupId: r.group ? null : groupId, groupName: r.group, greeting: r.greeting, maxPeople: r.maxPeople }));
                  if (await act({ action: "add", guests }, `Đã thêm ${rows.length} khách, mỗi người có link riêng.`)) setImported(null);
                }}
              >
                Thêm {rows.length} khách
              </button>
            </div>
          </Modal>
        );
      })()}

      {bulk !== null && (
        <Modal title="Thêm nhiều khách" onClose={() => setBulk(null)}>
          <p>
            Mỗi dòng một khách (hoặc một nhà). Có thể dán từ Excel, Zalo… Có sẵn file Excel/CSV?{" "}
            <button type="button" className="gm-linkbtn" onClick={() => { setBulk(null); fileInput.current?.click(); }}>
              Tải file lên
            </button>
          </p>
          <textarea className="gm-textarea" rows={8} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={"Anh Tuấn & Chị Hà\nGia đình chú Năm\nBạn Minh (lớp 12A1)"} />
          <button
            type="button"
            className="ce-btn primary"
            disabled={busy || !bulk.trim()}
            onClick={async () => {
              const names = bulk.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
              if (await act({ action: "add", guests: names.map((n) => ({ name: n, groupId })) }, `Đã thêm ${names.length} khách.`)) setBulk(null);
            }}
          >
            Thêm {bulk.split(/\r?\n/).filter((x) => x.trim()).length} khách{groupId ? " vào nhóm đang chọn" : ""}
          </button>
        </Modal>
      )}

      {editing && (
        <Modal title="Sửa khách mời" onClose={() => setEditing(null)}>
          <form
            className="gm-edit"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const max = String(fd.get("max") ?? "");
              const ok = await act(
                { action: "update", guestId: editing.id, patch: { name: fd.get("name"), groupId: fd.get("group") || null, greeting: fd.get("greeting"), maxPeople: max ? Number(max) : null } },
                "Đã lưu.",
              );
              if (ok) setEditing(null);
            }}
          >
            <label className="ib-field">
              <span>Tên trên thiệp</span>
              <input name="name" defaultValue={editing.name} maxLength={80} required />
            </label>
            <label className="ib-field">
              <span>Nhóm</span>
              <select name="group" defaultValue={editing.groupId ?? ""}>
                <option value="">Chưa có nhóm</option>
                {data.groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="ib-field">
              <span>Lời mời riêng (không bắt buộc)</span>
              <input name="greeting" defaultValue={editing.greeting} maxLength={200} placeholder="Tới dự bữa cơm thân mật cùng gia đình" />
              <small>Thay cho dòng dưới tên khách trên thiệp của người này.</small>
            </label>
            <label className="ib-field">
              <span>Số người tối đa</span>
              <input name="max" type="number" min={1} max={20} defaultValue={editing.maxPeople ?? ""} placeholder="Khách tự chọn" />
            </label>
            <div className="ce-row between">
              <button
                type="button"
                className="ce-btn ghost danger"
                onClick={async () => {
                  if (!confirm(`Xoá ${editing.name}?`)) return;
                  if (await act({ action: "delete", ids: [editing.id] }, "Đã xoá khách.")) setEditing(null);
                }}
              >
                Xoá khách
              </button>
              <button type="submit" className="ce-btn primary" disabled={busy}>
                Lưu
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast && (
        <div className={`ce-toast ${toast.err ? "err" : "ok"}`} role={toast.err ? "alert" : "status"}>
          {toast.m}
        </div>
      )}
    </div>
  );
}
