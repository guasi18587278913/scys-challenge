"use client";

import { useActionState } from "react";
import { useTransition } from "react";
import clsx from "clsx";
import { updatePreferencesAction } from "@/lib/actions/user";

type MetricOption = {
  key: string;
  label: string;
  required: boolean;
};

const initialState = { success: false, error: undefined } as const;

export function PreferencesForm({
  options,
  selected,
  sharePhotos,
}: {
  options: MetricOption[];
  selected: string[];
  sharePhotos: boolean;
}) {
  const [state, formAction] = useActionState(updatePreferencesAction, initialState);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => formAction(formData))}
      className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(97,82,73,0.18)]"
    >
      <div>
        <h3 className="text-lg font-semibold text-ink">记录偏好</h3>
        <p className="text-sm text-neutral-500">选择默认展示的指标，同时设置照片隐私策略。</p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option.key) || option.required;
          return (
            <label
              key={option.key}
              className={clsx(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
                checked
                  ? "border-ink/60 bg-white/80 text-ink"
                  : "border-white/60 bg-white/60 text-neutral-600"
              )}
            >
              <input
                type="checkbox"
                name="metrics"
                value={option.key}
                defaultChecked={checked}
                disabled={option.required}
                className="h-4 w-4 rounded border border-neutral-300 text-neutral-700 focus:ring-neutral-500"
              />
              <span className="flex-1">{option.label}</span>
              {option.required ? (
                <span className="text-xs text-neutral-400">必选</span>
              ) : null}
            </label>
          );
        })}
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-600">
        <input
          type="checkbox"
          name="sharePhotosByDefault"
          defaultChecked={sharePhotos}
          className="h-4 w-4 rounded border border-neutral-300 text-neutral-700 focus:ring-neutral-500"
        />
        默认允许其他成员查看我上传的照片
      </label>

      {state.error ? (
        <p className="rounded-2xl bg-red-50/80 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-2xl bg-green-50/80 px-3 py-2 text-sm text-green-600">已保存偏好。</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f3c5a3] via-[#f1d3bd] to-[#d7d0ff] px-5 py-3 text-base font-semibold text-ink shadow-[0_16px_32px_rgba(156,120,102,0.25)] transition hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(123,101,90,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "保存中..." : "保存偏好"}
      </button>
    </form>
  );
}
