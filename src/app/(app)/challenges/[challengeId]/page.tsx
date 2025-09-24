import { notFound } from "next/navigation";
import { format, isAfter } from "date-fns";
import { getChallengeContext, buildChallengeSummary } from "@/lib/data-service";
import { PenaltyForm } from "@/components/penalty-form";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  const context = await getChallengeContext(challengeId);

  if (!context) {
    notFound();
  }

  const challenge = context.challenge;
  const summary = buildChallengeSummary(context);
  const ended = isAfter(new Date(), new Date(challenge.endOn));

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_18px_50px_rgba(97,82,73,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(214,208,255,0.25),transparent),radial-gradient(circle_at_90%_30%,rgba(255,195,156,0.25),transparent)]" />
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">挑战周期</p>
              <h1 className=" text-3xl font-semibold text-ink">
                {challenge.label}
              </h1>
              <p className="text-sm text-neutral-500">
                {format(new Date(challenge.startOn), "yyyy年MM月dd日")} — {format(new Date(challenge.endOn), "yyyy年MM月dd日")}
              </p>
            </div>
            <span className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-neutral-500">
              {ended ? "挑战已结束" : "挑战进行中"}
            </span>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
            <p>{challenge.rules}</p>
            <span className="rounded-full bg-[#fcdcc9]/70 px-4 py-2 text-[#a06038]">{challenge.penalty}</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(97,82,73,0.18)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">成员达成状态</h2>
          <span className="text-xs text-neutral-400">惩罚操作{ended ? "可用" : "需挑战结束后"}</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {summary.map((item) => (
            <div
              key={item.target.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-neutral-600"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm text-white"
                    style={{ backgroundColor: item.target.colorHex }}
                  >
                    {item.target.userDisplayName.slice(0, 1)}
                  </span>
                  {item.target.userDisplayName}
                </span>
                <span className={item.achieved ? "text-[#1c8c5d]" : "text-[#a06038]"}>
                  {item.achieved ? "已完成" : "未完成"}
                </span>
              </div>
              <div className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-xs text-neutral-500">
                <p>目标：{item.target.targetDeltaKg.toFixed(1)} kg</p>
                <p>实际：{item.actualDeltaKg.toFixed(1)} kg</p>
                <p>
                  余量：{typeof item.progress?.remaining === "number" ? `${item.progress.remaining.toFixed(1)} kg` : "-"}
                </p>
              </div>
              <PenaltyForm
                challengeId={challenge.id}
                userId={item.target.userId}
                status={item.target.penaltyStatus}
                note={item.target.penaltyNote}
                disabled={!ended}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(97,82,73,0.18)]">
        <h2 className="text-lg font-semibold text-ink">每日记录</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {summary.map((item) => (
            <div key={`${item.target.id}-entries`} className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm text-neutral-600">
                <span className="flex items-center gap-2 text-ink">
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                    style={{ backgroundColor: item.target.colorHex }}
                  >
                    {item.target.userDisplayName.slice(0, 1)}
                  </span>
                  {item.target.userDisplayName}
                </span>
                <span className="text-xs text-neutral-400">
                  {item.progress?.entries?.length ?? 0} 条记录
                </span>
              </div>
              <div className="space-y-2">
                {(item.progress?.entries ?? []).map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-xs text-neutral-600"
                  >
                    <div className="flex items-center justify-between">
                      <span>{format(new Date(entry.date), "MM月dd日")}</span>
                      <span className="font-medium text-ink">{entry.weightKg.toFixed(1)} kg</span>
                    </div>
                    {entry.activityType ? (
                      <p className="mt-1 text-neutral-500">活动：{entry.activityType}</p>
                    ) : null}
                    {entry.meals ? (
                      <p className="mt-1 text-neutral-500">
                        饮食：
                        {[entry.meals.breakfast, entry.meals.lunch, entry.meals.dinner]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </p>
                    ) : null}
                    {entry.mealPhotoPath ? (
                      <a
                        href={entry.mealPhotoPath}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex text-[11px] text-neutral-400 underline"
                      >
                        查看餐食照片
                      </a>
                    ) : null}
                    {entry.note ? <p className="mt-1 text-neutral-500">{entry.note}</p> : null}
                    {entry.photoPath ? (
                      <a
                        href={entry.photoPath}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex text-[11px] text-neutral-400 underline"
                      >
                        查看照片
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
