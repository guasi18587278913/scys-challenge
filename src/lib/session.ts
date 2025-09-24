import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session-config";

export type SessionData = {
  userId?: string;
  remember?: boolean;
};

export async function getSession() {
  const store = await cookies();
  return getIronSession<SessionData>(store, sessionOptions);
}

export async function requireUserId() {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.userId;
}

export async function setUserSession(userId: string, remember: boolean) {
  const session = await getSession();
  session.userId = userId;
  session.remember = remember;
  // iron-session v8 不再支持动态修改 cookieOptions
  // 使用固定的 7 天过期时间
  await session.save();
}

export async function clearSession() {
  const session = await getSession();
  await session.destroy();
}
