"use client";

import { useActionState } from "react";
import { useTransition } from "react";
import { updatePenaltyStatusAction } from "@/lib/actions/challenges";
import type { PenaltyStatus } from "@/lib/types";

const initialState = { success: false, error: undefined } as const;

export function PenaltyForm({
  challengeId,
  userId,
  status,
  note,
  disabled,
}: {
  challengeId: string;
  userId: string;
  status: PenaltyStatus;
  note?: string;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(updatePenaltyStatusAction, initialState);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => formAction(formData));
      }}
      className="space-y-2 text-xs"
    >
      <input type="hidden" name="challengeId" value={challengeId} />
      <input type="hidden" name="userId" value={userId} />
      <label className="flex items-center gap-2 text-neutral-500">
        <span>惩罚状态</span>
        <select
          name="status"
          defaultValue={status}
          disabled={disabled || isPending}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2"
        >
          <option value="PENDING">待确认</option>
          <option value="COMPLETED">已执行</option>
          <option value="WAIVED">已豁免</option>
        </select>
      </label>
      <textarea
        name="note"
        defaultValue={note ?? ""}
        placeholder="备注转账或说明"
        disabled={disabled || isPending}
        rows={2}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-neutral-600 outline-none focus:border-neutral-400"
      />
      {state.error ? (
        <p className="text-red-500">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={disabled || isPending}
        className="inline-flex items-center rounded-full border border-white/60 bg-white/80 px-3 py-1 text-xs text-neutral-600 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
