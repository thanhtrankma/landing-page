"use client";

import { useEffect, useState } from "react";
import type { PublicWish } from "@/lib/invites/types";
import { T, useInvite, useTt } from "./lang";

// Sections shared by every theme (placed in the theme's `wishes` slot): wedding-day schedule, dress code,
// RSVP and guestbook. They take their colours from the theme's --iv-* variables.

export function Schedule() {
  const { d } = useInvite();
  if (!d.schedule.items.length) return null;
  return (
    <section className="iv-sec iv-schedule">
      {d.schedule.title && <h2 className="iv-block-title iv-reveal">{d.schedule.title}</h2>}
      <ol className="iv-timeline">
        {d.schedule.items.map((it, i) => (
          <li key={i} className="iv-reveal">
            <b>{it.time}</b>
            <span>{it.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function DressCode() {
  const { d } = useInvite();
  if (!d.dressCode.colors.length && !d.dressCode.note) return null;
  return (
    <section className="iv-sec iv-dress">
      <h2 className="iv-block-title iv-reveal">Dress code</h2>
      {d.dressCode.note && <p className="iv-dress-note iv-reveal">{d.dressCode.note}</p>}
      <div className="iv-dress-colors iv-reveal">
        {d.dressCode.colors.map((c) => (
          <span key={c} style={{ background: c }} title={c} />
        ))}
      </div>
    </section>
  );
}

type Status = "yes" | "no" | "maybe";

function RsvpForm({ onDone }: { onDone: () => void }) {
  const { d, guest, slug, preview, demo } = useInvite();
  const tt = useTt();
  const [status, setStatus] = useState<Status | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const cap = guest?.maxPeople ?? d.rsvp.limit ?? 10;
  const disabled = !slug || preview || demo;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled || !status) return;
    const fd = new FormData(e.currentTarget);
    const answers: Record<string, string> = {};
    for (const q of d.rsvp.questions) answers[q.id] = String(fd.get(`q-${q.id}`) ?? "");
    setState("sending");
    try {
      const res = await fetch(`/api/thiep/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: guest?.code, name: fd.get("name"), status, people: fd.get("people"), answers, website: fd.get("website") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không gửi được, vui lòng thử lại.");
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  };

  return (
    <form className="iv-form iv-rsvp-form" onSubmit={submit}>
      <p className="iv-rsvp-q">{guest ? <>{guest.name} <T vi="sẽ đến chung vui chứ?" en="will you join us?" /></> : <T vi="Bạn sẽ đến chung vui chứ?" en="Will you join us?" />}</p>
      <div className="iv-rsvp-choices" role="radiogroup">
        {(
          [
            ["yes", "Tôi sẽ đến", "I'll be there"],
            ["no", "Không đến được", "Can't make it"],
          ] as const
        ).map(([v, vi, en]) => (
          <button key={v} type="button" role="radio" aria-checked={status === v} className={status === v ? "on" : ""} onClick={() => setStatus(v)}>
            <T vi={vi} en={en} />
          </button>
        ))}
      </div>
      {!guest && <input name="name" required maxLength={80} placeholder={tt("Tên của bạn", "Your name")} aria-label={tt("Tên của bạn", "Your name")} />}
      {status === "yes" && (
        <label className="iv-field">
          <span>
            <T vi="Số người tham dự" en="Number of guests" />
          </span>
          <select name="people" defaultValue="1">
            {Array.from({ length: cap }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      {status === "yes" &&
        d.rsvp.questions.map((q) => (
          <label key={q.id} className="iv-field">
            <span>{q.label}</span>
            {q.type === "choice" ? (
              <select name={`q-${q.id}`} defaultValue="">
                <option value="">—</option>
                {q.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input name={`q-${q.id}`} maxLength={200} />
            )}
          </label>
        ))}
      <input name="website" tabIndex={-1} autoComplete="off" className="iv-hp" aria-hidden="true" />
      <button type="submit" disabled={!status || state === "sending" || disabled}>
        {state === "sending" ? "…" : <T vi="Gửi xác nhận" en="Send" />}
      </button>
      {state === "error" && <p className="iv-form-err">{error}</p>}
      {disabled && <p className="iv-form-note">{preview ? "Bản xem trước: form hoạt động khi thiệp được xuất bản." : "Đây là thiệp mẫu, form chưa gửi được."}</p>}
    </form>
  );
}

export function Rsvp() {
  const { d, guest } = useInvite();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const thanks = (
    <div className="iv-rsvp-done" role="status">
      <b>
        <T vi="Cảm ơn bạn đã phản hồi!" en="Thank you for your reply!" />
      </b>
    </div>
  );
  return (
    <section className="iv-sec iv-rsvp-block">
      <h2 className="iv-block-title iv-reveal">
        <T vi="Xác nhận tham dự" en="RSVP" />
      </h2>
      <p className="iv-rsvp-sub iv-reveal">
        <T vi="Hãy cho chúng mình biết bạn có đến được không để đón tiếp chu đáo nhé." en="Please let us know if you can make it." />
      </p>
      {done ? (
        thanks
      ) : d.rsvp.mode === "inline" ? (
        <RsvpForm onDone={() => setDone(true)} />
      ) : (
        <button type="button" className="iv-rsvp-open iv-reveal" onClick={() => setOpen(true)}>
          <T vi="Xác nhận tham dự" en="RSVP" />
        </button>
      )}
      {open && !done && (
        <div className="iv-modal" role="dialog" aria-modal="true" aria-label="Xác nhận tham dự" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="iv-modal-card">
            <button type="button" className="iv-modal-close" onClick={() => setOpen(false)} aria-label="Đóng">
              ×
            </button>
            <h3>{guest ? guest.name : <T vi="Xác nhận tham dự" en="RSVP" />}</h3>
            <RsvpForm
              onDone={() => {
                setDone(true);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export function Guestbook({ initial }: { initial: PublicWish[] }) {
  const { slug, guest, preview, demo } = useInvite();
  const tt = useTt();
  const [wishes, setWishes] = useState(initial);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const disabled = !slug || preview || demo;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState("sending");
    try {
      const res = await fetch(`/api/thiep/${slug}/wishes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không gửi được, vui lòng thử lại.");
      if (data.wish) setWishes((w) => [data.wish, ...w]);
      form.reset();
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  };

  return (
    <section className="iv-sec iv-rsvp iv-guestbook">
      <h2 className="iv-script iv-reveal">
        <T vi="Sổ lưu bút" en="Guestbook" />
      </h2>
      <form className="iv-form iv-reveal" onSubmit={submit}>
        <input name="name" required maxLength={60} defaultValue={guest?.name ?? ""} placeholder={tt("Tên của bạn", "Your name")} aria-label={tt("Tên của bạn", "Your name")} />
        <textarea name="message" required maxLength={500} rows={3} placeholder={tt("Gửi lời chúc tới cô dâu chú rể…", "Your wishes for the couple…")} aria-label={tt("Lời chúc", "Wishes")} />
        <input name="website" tabIndex={-1} autoComplete="off" className="iv-hp" aria-hidden="true" />
        <button type="submit" disabled={state === "sending" || disabled}>
          {state === "sending" ? "…" : <T vi="Gửi lời chúc" en="Send wishes" />}
        </button>
        {state === "done" && <p className="iv-form-note">Cảm ơn bạn! Lời chúc đã được gửi.</p>}
        {state === "error" && <p className="iv-form-err">{error}</p>}
        {disabled && <p className="iv-form-note">{preview ? "Bản xem trước: sổ lưu bút hoạt động khi thiệp được xuất bản." : "Đây là thiệp mẫu, chưa gửi được lời chúc."}</p>}
      </form>
      {wishes.length > 0 ? (
        <div className="iv-wishes" aria-label="Lời chúc">
          {wishes.map((w) => (
            <figure key={w.id}>
              <blockquote>{w.message}</blockquote>
              <figcaption>— {w.name}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="iv-form-note">
          <T vi="Chưa có lời chúc nào. Hãy là người đầu tiên!" en="No wishes yet. Be the first!" />
        </p>
      )}
    </section>
  );
}
