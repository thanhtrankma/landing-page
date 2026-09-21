import "server-only";
import { env } from "./env";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** Best effort: a failed notification must never make the visitor's form submission fail. */
export async function sendTelegram(html: string): Promise<boolean> {
  if (!env.telegramToken || !env.telegramChatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.telegramChatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("[telegram] send failed:", res.status, (await res.text()).slice(0, 200));
    return res.ok;
  } catch (e) {
    console.error("[telegram] send error:", (e as Error).message);
    return false;
  }
}

export const notifyNewLead = (lead: { name: string; phone: string; message: string; page?: string }, origin: string) =>
  sendTelegram(
    [
      "🔔 <b>Yêu cầu tư vấn mới</b>",
      `👤 ${esc(lead.name)}`,
      `📞 ${esc(lead.phone)} · <a href="https://zalo.me/${esc(lead.phone)}">Zalo</a>`,
      `💬 ${esc(clip(lead.message, 600))}`,
      lead.page ? `📄 ${esc(lead.page)}` : "",
      `👉 <a href="${esc(origin)}/admin/leads">Mở trang quản trị</a>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
