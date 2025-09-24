import Link from "next/link";
import { format, isAfter } from "date-fns";
import { buildChallengeSummary, getChallengeContext, listChallenges } from "@/lib/data-service";

export default async function ChallengesPage() {
  const challenges = await listChallenges();

  if (challenges.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-400/40 bg-white/70 p-12 text-center text-neutral-500">
        暂无挑战记录。
      </div>
    );
  }

  const details = await Promise.all(
    challenges.map(async (challenge) => {
      const context = await getChallengeContext(challenge.id);
      return {
        challenge,
        summary: context ? buildChallengeSummary(context) : [],
      };
    })
  );

  return (
    <div className="space-y-8">
      {details.map(({ challenge, summary }) => {
        const end = new Date(challenge.endOn);
        const ended = isAfter(new Date(), end);
        const achievedCount = summary.filter((item) => item.achieved).length;
        const pendingPenalty = summary.filter(
          (item) => item.target.penaltyStatus === "PENDING" && ended
        ).length;
        return (
          <div
            key={challenge.id}
            className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_18px_50px_rgba(97,82,73,0.18)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_-10%,rgba(214,208,255,0.25),transparent),radial-gradient(circle_at_90%_20%,rgba(255,195,156,0.2),transparent)]" />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">挑战</p>
                  <h2 className=" text-2xl font-semibold text-ink">
                    {challenge.label}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {format(new Date(challenge.startOn), "MM月dd日")} — {format(end, "MM月dd日")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1">
                    完成度 {achievedCount}/3
                  </span>
                  <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1">
                    {ended ? "已结束" : "进行中"}
                  </span>
                  <Link
                    href={`/challenges/${challenge.id}`}
                    className="inline-flex items-center rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-neutral-600 hover:text-ink"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {summary.map((item) => (
                  <div
                    key={item.target.id}
                    className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-neutral-600"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-ink">
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                          style={{ backgroundColor: item.target.colorHex }}
                        >
                          {item.target.userDisplayName.slice(0, 1)}
                        </span>
                        {item.target.userDisplayName}
                      </span>
                      <span className={item.achieved ? "text-[#1c8c5d]" : "text-[#a06038]"}>
                        {item.achieved ? "达成" : "未达成"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      目标 {item.target.targetDeltaKg.toFixed(1)} kg · 实际 {item.actualDeltaKg.toFixed(1)} kg
                    </p>
                    <p className="text-xs text-neutral-400">
                      惩罚状态：{item.target.penaltyStatus === "PENDING" ? "待确认" : item.target.penaltyStatus === "COMPLETED" ? "已执行" : "已豁免"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs text-neutral-600">
                <p>{challenge.rules}</p>
                <span className="rounded-full bg-[#fcdcc9]/70 px-3 py-1 text-[#a06038]">{challenge.penalty}</span>
                {pendingPenalty > 0 ? (
                  <span className="rounded-full bg-red-50/80 px-3 py-1 text-red-600">
                    {pendingPenalty} 人待乐捐
                  </span>
                ) : null}
              </div>

              <div className="space-y-3 rounded-2xl border border-white/60 bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">团队日志</h3>
                  <Link
                    href={`/team-log/${challenge.id}`}
                    className="text-xs text-neutral-500 underline hover:text-ink"
                  >
                    查看全部 →
                  </Link>
                </div>
                <ul className="space-y-2 text-xs text-neutral-500">
                  {summary.flatMap((member) => (member.progress?.entries ?? []).slice(-2)).length === 0 ? (
                    <li>暂无记录，大家先完成打卡吧。</li>
                  ) : (
                    summary
                      .map((member) => ({
                        name: member.target.userDisplayName,
                        color: member.target.colorHex,
                        entries: (member.progress?.entries ?? []).slice(-2),
                      }))
                      .flatMap(({ name, color, entries }) =>
                        entries.map((entry) => (
                          <li key={entry.id} className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2">
                            <span className="flex items-center gap-2">
                              <span
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white"
                                style={{ backgroundColor: color }}
                              >
                                {name.slice(0, 1)}
                              </span>
                              <span className="text-neutral-600">{name}</span>
                            </span>
                            <span className="text-neutral-400">
                              {format(new Date(entry.date), "MM月dd日")}
                            </span>
                            <span className="text-neutral-500">体重 {entry.weightKg.toFixed(1)} kg</span>
                          </li>
                        ))
                      )
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
