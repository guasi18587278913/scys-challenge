/* eslint-disable @next/next/no-img-element */
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/auth";
import {
  getChallengeContext,
  buildChallengeSummary,
  listEntriesForUser,
  getStreakLength,
} from "@/lib/data-service";
import { METRIC_OPTIONS } from "@/lib/constants";
import { PreferencesForm } from "@/components/preferences-form";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const [user, entries, streak, context] = await Promise.all([
    findUserById(session.userId),
    listEntriesForUser(session.userId),
    getStreakLength(session.userId),
    getChallengeContext(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const latestEntry = entries[0];
  const totalRecords = entries.length;
  const latestPhotos = entries.filter((entry) => entry.photoPath).slice(0, 4);

  const myProgress = context
    ? buildChallengeSummary(context).find((item) => item.target.userId === user.id)
    : undefined;

  const preferenceOptions = METRIC_OPTIONS.map((option) => ({
    key: option.key,
    label: option.label,
    required: option.required,
  }));

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(97,82,73,0.18)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-white"
              style={{ backgroundColor: user.colorHex }}
            >
              {user.displayName.slice(0, 1)}
            </span>
            <div>
              <h1 className=" text-2xl font-semibold text-ink">
                {user.displayName}
              </h1>
              <p className="text-sm text-neutral-500">持续性是最好的自律方式</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 md:grid-cols-4">
            <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
              <p className="text-xs text-neutral-400">最新体重</p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {latestEntry ? `${latestEntry.weightKg.toFixed(1)} kg` : "-"}
              </p>
              <p className="text-xs text-neutral-400">
                {latestEntry ? format(new Date(latestEntry.date), "MM月dd日") : "等待首条记录"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
              <p className="text-xs text-neutral-400">连续打卡</p>
              <p className="mt-1 text-lg font-semibold text-ink">{streak} 天</p>
              <p className="text-xs text-neutral-400">最近 14 天内</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
              <p className="text-xs text-neutral-400">累计记录</p>
              <p className="mt-1 text-lg font-semibold text-ink">{totalRecords}</p>
              <p className="text-xs text-neutral-400">自首次挑战以来</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
              <p className="text-xs text-neutral-400">当前挑战</p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {myProgress ? `${myProgress.actualDeltaKg.toFixed(1)} / ${myProgress.target.targetDeltaKg.toFixed(1)} kg` : "-"}
              </p>
              <p className="text-xs text-neutral-400">
                {myProgress?.achieved ? "已完成" : "进行中"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <PreferencesForm
        options={preferenceOptions}
        selected={user.preferences.metrics}
        sharePhotos={user.preferences.sharePhotosByDefault}
      />

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(97,82,73,0.18)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">最新照片</h2>
          <span className="text-xs text-neutral-400">展示最近 {latestPhotos.length} 张</span>
        </div>
        {latestPhotos.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">还没有上传任何进度照片。</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestPhotos.map((entry) => (
              <div key={entry.id} className="overflow-hidden rounded-2xl border border-white/60 bg-white/70">
                <img src={entry.photoPath!} alt={entry.date} className="h-48 w-full object-cover" />
                <div className="px-4 py-3 text-xs text-neutral-500">
                  <p className="font-medium text-ink">{format(new Date(entry.date), "MM月dd日")}</p>
                  {entry.note ? <p className="mt-1 text-neutral-500">{entry.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
