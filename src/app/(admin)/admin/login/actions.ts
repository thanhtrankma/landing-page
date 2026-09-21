"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";
import type { FormState } from "@/lib/validate";

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const result = await login(String(fd.get("password") ?? ""));
  if (!result.ok) return { error: result.error };
  redirect("/admin");
}
