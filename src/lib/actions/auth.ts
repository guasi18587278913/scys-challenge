"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validators";
import { authenticate } from "@/lib/auth";
import { setUserSession, clearSession } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const data = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse({
    username: data.username,
    password: data.password,
    remember: data.remember === "on",
  });

  const redirectTo = typeof data.redirect === "string" && data.redirect ? data.redirect : "/dashboard";

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "请输入完整信息" };
  }

  const user = await authenticate(parsed.data.username, parsed.data.password);
  if (!user) {
    return { error: "账号或密码不正确" };
  }

  await setUserSession(user.id, parsed.data.remember ?? false);
  redirect(redirectTo);
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
