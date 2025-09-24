import { format } from "date-fns";
import { redirect } from "next/navigation";
import { EntryForm } from "@/components/entry-form";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/auth";
import { getChallengeContext } from "@/lib/data-service";
import { METRIC_OPTIONS } from "@/lib/constants";

function clampDate(date: Date, start: Date, end: Date) {
  if (date < start) return start;
  if (date > end) return end;
  return date;
}

export default async function RecordPage() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const [context, user] = await Promise.all([
    getChallengeContext(),
    findUserById(session.userId),
  ]);

  if (!context || !user) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-400/40 bg-white/70 p-12 text-center text-neutral-500">
        暂无挑战周期，等待管理员配置后即可开始记录。
      </div>
    );
  }

  const challenge = context.challenge;
  const start = new Date(challenge.startOn);
  const end = new Date(challenge.endOn);
  const today = new Date();
  const defaultDate = clampDate(today, start, end).toISOString().slice(0, 10);

  const userEntries = (context.entriesByUser[session.userId] ?? []).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const entryLite = userEntries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    weightKg: entry.weightKg,
    exerciseMinutes: entry.exerciseMinutes,
    activityType: entry.activityType,
    meals: entry.meals,
    mealPhotoPath: entry.mealPhotoPath,
    note: entry.note,
    photoPath: entry.photoPath,
    photoShared: entry.photoShared,
  }));

  const sortedForList = [...userEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentEntries = sortedForList.slice(0, 6);

  const preferredMetrics = METRIC_OPTIONS.filter((metric) =>
    user.preferences.metrics.includes(metric.key)
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <EntryForm
        challenge={{
          startOn: challenge.startOn,
          endOn: challenge.endOn,
          label: challenge.label,
        }}
        defaultDate={defaultDate}
        entries={entryLite}
        metricOptions={preferredMetrics}
        sharePhotosByDefault={user.preferences.sharePhotosByDefault}
      />

      <aside className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(97,82,73,0.18)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">近期记录</h3>
          <span className="text-xs text-neutral-400">最新 {recentEntries.length} 条</span>
        </div>
        <div className="space-y-3">
          {recentEntries.length === 0 ? (
            <p className="text-sm text-neutral-500">还没有数据，先完成第一次称重吧。</p>
          ) : (
            recentEntries.map((entry, index) => {
              const nextEntry = recentEntries[index + 1];
              const delta = nextEntry ? entry.weightKg - nextEntry.weightKg : undefined;
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/75 px-4 py-3 text-sm text-neutral-600"
                >
                  <div>
                    <p className="font-medium text-ink">{format(new Date(entry.date), "MM月dd日")}</p>
                    <p className="text-xs text-neutral-500">
                      {nextEntry && typeof delta === "number"
                        ? delta >= 0
                          ? `较前一日 +${delta.toFixed(1)} kg`
                          : `较前一日 ${delta.toFixed(1)} kg`
                        : "首次记录"}
                    </p>
                    {entry.activityType ? (
                      <p className="mt-1 text-xs text-neutral-500">活动：{entry.activityType}</p>
                    ) : null}
                    {entry.meals ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        饮食：
                        {[entry.meals.breakfast, entry.meals.lunch, entry.meals.dinner]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-ink">{entry.weightKg.toFixed(1)} kg</p>
                    <p className="text-xs text-neutral-400">
                      {entry.photoPath
                        ? "进度照片"
                        : entry.mealPhotoPath
                        ? "餐食照片"
                        : entry.note
                        ? "有备注"
                        : "仅体重"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-neutral-500">
          <p>补录说明：</p>
          <ul className="mt-2 space-y-1">
            <li>· 仅支持在当前挑战周期内选择日期</li>
            <li>· 上传照片默认私密，可在记录时手动共享</li>
            <li>· 删除记录会同步更新仪表盘与历史挑战</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
