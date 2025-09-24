"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import clsx from "clsx";
import { loginAction } from "@/lib/actions/auth";

const initialState = { error: undefined } as const;

export function LoginForm({
  users,
  redirectTo,
}: {
  users: Array<{ id: string; username: string; displayName: string; colorHex: string }>;
  redirectTo?: string;
}) {
  const [selectedUser, setSelectedUser] = useState(users[0]?.username ?? "");
  const [state, formAction] = useActionState(loginAction, initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0].username);
    }
  }, [selectedUser, users]);

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          formAction(formData);
        });
      }}
      className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/40 bg-white/70 p-8 shadow-[0_30px_60px_rgba(120,105,94,0.18)] backdrop-blur"
    >
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">SCYS Challenge</p>
        <h1 className=" text-2xl font-semibold text-ink">
          登录减脂挑战
        </h1>
        <p className="text-sm text-neutral-500">请选择身份并输入通用密码</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {users.map((user) => {
          const isActive = selectedUser === user.username;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedUser(user.username)}
              className={clsx(
                "group flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all",
                isActive
                  ? "border-transparent bg-white shadow-[0_12px_24px_rgba(97,82,73,0.25)]"
                  : "border-white/60 bg-white/40 hover:border-white/80 hover:shadow-[0_12px_20px_rgba(97,82,73,0.18)]"
              )}
              style={{ boxShadow: isActive ? `0 12px 28px ${user.colorHex}33` : undefined }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: user.colorHex }}
              >
                {user.displayName.slice(0, 1)}
              </span>
              <span className="text-sm font-medium text-ink">{user.displayName}</span>
            </button>
          );
        })}
      </div>

      <input type="hidden" name="username" value={selectedUser} />
      {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-600">通用密码</label>
        <input
          type="password"
          name="password"
          defaultValue="scys2025"
          className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-base text-ink shadow-inner shadow-white/30 outline-none transition focus:border-neutral-400"
          placeholder="输入 scys2025"
          required
        />
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="h-4 w-4 rounded border border-neutral-300 text-neutral-700 focus:ring-neutral-500"
          />
          7 天内免登录
        </label>
      </div>

      {state?.error ? (
        <p className="rounded-xl bg-red-50/80 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !selectedUser}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f3c5a3] via-[#f1d3bd] to-[#d7d0ff] px-6 py-3 text-base font-semibold text-ink shadow-[0_16px_32px_rgba(156,120,102,0.25)] transition hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(123,101,90,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "登录中..." : "进入挑战"}
      </button>
    </form>
  );
}
