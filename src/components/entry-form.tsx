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
  exerciseMinutes?: number;
  activityType?: string;
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  mealPhotoPath?: string;
  note?: string;
  photoPath?: string;
  photoShared?: boolean;
};

type MetricOption = {
  key: string;
  label: string;
  required: boolean;
};

export function EntryForm({
  challenge,
  defaultDate,
  entries,
  metricOptions,
  sharePhotosByDefault,
}: {
  challenge: { startOn: string; endOn: string; label: string };
  defaultDate: string;
  entries: EntryLite[];
  metricOptions: MetricOption[];
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
      className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(97,82,73,0.18)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">记录日期</p>
          <h2 className=" text-2xl font-semibold text-ink">
            {selectedEntry ? "编辑记录" : "新增记录"}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <label className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-2">
            <span className="text-xs uppercase tracking-[0.4em] text-neutral-400">日期</span>
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
              className="inline-flex items-center rounded-full border border-red-200/60 bg-red-50/70 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100/80 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "删除中..." : "删除记录"}
            </button>
          ) : null}
        </div>
      </div>

      <input type="hidden" name="id" value={selectedEntry?.id ?? ""} />

      <div key={formKey} className="grid gap-4 md:grid-cols-2">
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

        {metricOptions.some((metric) => metric.key === "exerciseMinutes") ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-600">运动时长 (min)</label>
            <input
              type="number"
              step="1"
              name="exerciseMinutes"
              defaultValue={selectedEntry?.exerciseMinutes ?? ""}
              placeholder="例如 30"
              className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-base text-ink shadow-inner shadow-white/40 outline-none transition focus:border-neutral-400"
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-600">运动项目</label>
          <input
            type="text"
            name="activityType"
            defaultValue={selectedEntry?.activityType ?? ""}
            placeholder="例如 夜跑 30 分钟"
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-700 shadow-inner shadow-white/40 outline-none transition focus:border-neutral-400"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-600">早餐</label>
          <input
            type="text"
            name="breakfast"
            defaultValue={selectedEntry?.meals?.breakfast ?? ""}
            placeholder="例如 燕麦牛奶"
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-700 shadow-inner shadow-white/40 outline-none transition focus:border-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-600">午餐</label>
          <input
            type="text"
            name="lunch"
            defaultValue={selectedEntry?.meals?.lunch ?? ""}
            placeholder="例如 鸡胸便当"
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-700 shadow-inner shadow-white/40 outline-none transition focus:border-neutral-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-600">晚餐</label>
          <input
            type="text"
            name="dinner"
            defaultValue={selectedEntry?.meals?.dinner ?? ""}
            placeholder="例如 沙拉 + 鸡蛋"
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-700 shadow-inner shadow-white/40 outline-none transition focus:border-neutral-400"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-600">拍一下你的电子秤照片</label>
        <div className="flex flex-wrap items-center gap-3">
          <input type="file" name="mealPhoto" accept="image/*" className="text-xs" />
          <span className="text-xs text-neutral-500">可选，最大 5MB</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-600">备注</label>
        <textarea
          name="note"
          defaultValue={selectedEntry?.note ?? ""}
          rows={3}
          placeholder="记录一下今日饮食、训练或心情"
          className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-700 shadow-inner shadow-white/40 outline-none transition focus:border-neutral-400"
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-600 md:w-auto">
          <div className="space-y-1">
            <p className="font-medium text-ink">进度照片</p>
            <p className="text-xs text-neutral-500">支持 jpg/png，最大 5MB</p>
          </div>
          <input type="file" name="photo" accept="image/*" className="text-xs" />
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            name="photoShared"
            defaultChecked={shareDefault}
            className="h-4 w-4 rounded border border-neutral-300 text-neutral-700 focus:ring-neutral-500"
          />
          允许其他成员查看此照片
        </label>
      </div>

      {selectedEntry?.photoPath ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-sm text-neutral-500">
          <p className="mb-2 text-xs text-neutral-400">当前照片预览</p>
          <img
            src={selectedEntry.photoPath}
            alt="上传的照片"
            className="max-h-64 w-auto rounded-xl object-cover"
          />
        </div>
      ) : null}

      {selectedEntry?.mealPhotoPath ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-sm text-neutral-500">
          <p className="mb-2 text-xs text-neutral-400">三餐照片预览</p>
          <img
            src={selectedEntry.mealPhotoPath}
            alt="三餐照片"
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
          "mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f3c5a3] via-[#f1d3bd] to-[#d7d0ff] px-6 py-3 text-base font-semibold text-ink shadow-[0_16px_32px_rgba(156,120,102,0.25)] transition",
          "hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(123,101,90,0.35)]"
        )}
      >
        保存记录
      </button>
    </form>
  );
}
