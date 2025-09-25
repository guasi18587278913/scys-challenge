"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, useTransition } from "react";
import { useActionState } from "react";
import clsx from "clsx";
import { saveEntryAction, deleteEntryAction } from "@/lib/actions/entries";

const initialState = { success: false, error: undefined } as const;

type EntryLite = {
  id: string;
  date: string;
  weightKg: number;
  photoPath?: string;
  photoShared?: boolean;
};

export function EntryForm({
  challenge,
  defaultDate,
  entries,
  sharePhotosByDefault,
}: {
  challenge: { startOn: string; endOn: string; label: string };
  defaultDate: string;
  entries: EntryLite[];
  sharePhotosByDefault: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [state, formAction] = useActionState(saveEntryAction, initialState);
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    setSelectedDate(defaultDate);
  }, [defaultDate]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.date === selectedDate),
    [entries, selectedDate]
  );

  const formKey = `${selectedDate}-${selectedEntry?.id ?? "new"}`;
  const shareDefault = selectedEntry?.photoShared ?? sharePhotosByDefault;

  const minDate = challenge.startOn.slice(0, 10);
  const maxDate = challenge.endOn.slice(0, 10);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_18px_50px_rgba(97,82,73,0.18)] sm:gap-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-400 sm:text-xs">记录日期</p>
          <h2 className="text-xl font-semibold text-ink sm:text-2xl">
            {selectedEntry ? "编辑记录" : "新增记录"}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <label className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 sm:px-4">
            <span className="text-[11px] uppercase tracking-[0.4em] text-neutral-400 sm:text-xs">日期</span>
            <input
              type="date"
              name="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              min={minDate}
              max={maxDate}
              className="rounded-xl border border-neutral-200 px-3 py-2 text-neutral-700 outline-none focus:border-neutral-400"
              required
            />
          </label>
          {selectedEntry ? (
            <button
              type="button"
              onClick={() =>
                startDelete(async () => {
                  await deleteEntryAction(selectedEntry.id);
                })
              }
              disabled={isDeleting}
              className="inline-flex items-center rounded-full border border-red-200/60 bg-red-50/70 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100/80 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {isDeleting ? "删除中..." : "删除记录"}
            </button>
          ) : null}
        </div>
      </div>

      <input type="hidden" name="id" value={selectedEntry?.id ?? ""} />

      <div key={formKey} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-600">体重 (kg)</label>
          <input
            type="number"
            step="0.1"
            name="weightKg"
            defaultValue={selectedEntry?.weightKg ?? ""}
            placeholder="例如 60.5"
            required
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-base text-ink shadow-inner shadow-white/40 outline-none transition focus:border-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-600">秤面照片</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              name="photo"
              accept="image/*"
              capture="environment"
              className="text-xs"
              required={!selectedEntry?.photoPath}
            />
            <span className="text-xs text-neutral-500">请拍摄清晰秤面，最大 5MB</span>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input
          type="checkbox"
          name="photoShared"
          defaultChecked={shareDefault}
          className="h-4 w-4 rounded border border-neutral-300 text-neutral-700 focus:ring-neutral-500"
        />
        允许管理员查看照片
      </label>

      {selectedEntry?.photoPath ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-xs text-neutral-500 sm:text-sm">
          <p className="mb-2 text-[11px] text-neutral-400 sm:text-xs">当前秤面照片</p>
          <img
            src={selectedEntry.photoPath}
            alt="电子秤照片"
            className="max-h-64 w-auto rounded-xl object-cover"
          />
        </div>
      ) : null}

      {state.error ? (
        <p className="rounded-2xl bg-red-50/80 px-4 py-3 text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-2xl bg-green-50/80 px-4 py-3 text-sm text-green-700">已保存，已刷新仪表盘。</p>
      ) : null}

      <button
        type="submit"
        className={clsx(
          "mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f3c5a3] via-[#f1d3bd] to-[#d7d0ff] px-6 py-3 text-base font-semibold text-ink shadow-[0_16px_32px_rgba(156,120,102,0.25)] transition",
          "hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(123,101,90,0.35)]"
        )}
      >
        保存记录
      </button>
    </form>
  );
}
