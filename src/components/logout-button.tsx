"use client";

import { useTransition } from "react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm transition hover:border-ink/40 hover:text-ink"
      disabled={isPending}
    >
      {isPending ? "正在退出..." : "退出"}
    </button>
  );
}
