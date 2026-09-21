"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { LEAD_STATUSES, deleteLead, updateLead, type LeadStatus } from "@/lib/repo";
import { text } from "@/lib/validate";

export async function saveLeadAction(fd: FormData) {
  await requireAdmin();
  const status = text(fd, "status") as LeadStatus;
  await updateLead(text(fd, "id"), { status: LEAD_STATUSES.includes(status) ? status : undefined, note: text(fd, "note") });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLeadAction(fd: FormData) {
  await requireAdmin();
  await deleteLead(text(fd, "id"));
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
