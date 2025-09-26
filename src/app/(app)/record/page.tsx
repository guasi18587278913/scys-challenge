import { format } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EntryForm } from "@/components/entry-form";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/auth";
import { getChallengeContext } from "@/lib/data-service";

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
    photoPath: entry.photoPath,
    photoShared: entry.photoShared,
  }));

  const sortedForList = [...userEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentEntries = sortedForList.slice(0, 6);

  const todayStr = today.toISOString().slice(0, 10);
  const hasLoggedToday = userEntries.some(e => e.date === todayStr);
  const latestEntry = sortedForList[0];

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const msUntilDeadline = Math.max(0, endOfDay.getTime() - today.getTime());
  const hoursUntilDeadline = Math.floor(msUntilDeadline / (1000 * 60 * 60));
  const minutesUntilDeadline = Math.floor(msUntilDeadline / (1000 * 60)) % 60;

  return (
    <div className="grid gap-5 xl:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-4">
        {!hasLoggedToday && (
          <div className="animate-pulse rounded-2xl border-2 border-red-200 bg-red-50/90 px-5 py-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-800">今日尚未打卡</p>
                <p className="text-xs text-red-600 mt-1">
                  距离罚没截止：{hoursUntilDeadline} 小时 {minutesUntilDeadline} 分钟
                </p>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {hoursUntilDeadline.toString().padStart(2, '0')}:{minutesUntilDeadline.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        <EntryForm
          challenge={{
            startOn: challenge.startOn,
            endOn: challenge.endOn,
            label: challenge.label,
          }}
          defaultDate={defaultDate}
          entries={entryLite}
          sharePhotosByDefault={user.preferences.sharePhotosByDefault}
          latestWeight={latestEntry?.weightKg}
          hasLoggedToday={hasLoggedToday}
          hoursUntilDeadline={hoursUntilDeadline}
          minutesUntilDeadline={minutesUntilDeadline}
        />
      </div>

      <aside className="flex flex-col gap-5 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_18px_50px_rgba(97,82,73,0.18)] sm:gap-6 sm:p-6">
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
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-ink">{entry.weightKg.toFixed(1)} kg</p>
                    <p className="text-xs text-neutral-400">
                      {entry.photoPath ? "已上传秤面" : "仅体重"}
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
            <li>· 打卡需在当日 00:00 前提交，逾期将自动罚没</li>
            <li>· 仅允许当前挑战周期内的日期</li>
            <li>· 秤面照片默认仅管理员可见</li>
          </ul>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white/80 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-white hover:border-neutral-400"
        >
          查看他人状态 →
        </Link>
      </aside>
    </div>
  );
}
