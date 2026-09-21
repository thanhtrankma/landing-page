import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { TAGS } from "./site-data";

/** Call from server actions after a write so the public site shows the change immediately. */
export function refreshSite(...tags: (keyof typeof TAGS)[]) {
  for (const t of tags) updateTag(TAGS[t]);
  revalidatePath("/", "layout");
}
