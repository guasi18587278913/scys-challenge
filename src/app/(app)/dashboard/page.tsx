import { format, differenceInCalendarDays, isAfter } from "date-fns";
import Link from "next/link";
import { TrendChart } from "@/components/trend-chart";
import {
  buildChallengeSummary,
  getChallengeContext,
  listChallenges,
} from "@/lib/data-service";
import { getSession } from "@/lib/session";

function formatDate(date: string) {
  return format(new Date(date), "MM月dd日");
}

export default async function DashboardPage() {
  const session = await getSession();
  const context = await getChallengeContext();

  if (!context) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-400/40 bg-white/70 p-12 text-center text-neutral-500">
        暂无挑战数据，请先在后台配置首个挑战周期。
      </div>
    );
  }

  const summary = buildChallengeSummary(context);
  const currentUserId = session.userId ?? summary[0]?.target.userId;
  const personal = summary.find((item) => item.target.userId === currentUserId) ?? summary[0];
  const teammates = summary.filter((item) => item.target.userId !== personal.target.userId);
  const challenge = context.challenge;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const endOfDay = new Date(today);
  endOfDay.setHours(24, 0, 0, 0);
  const msUntilDeadline = Math.max(0, endOfDay.getTime() - today.getTime());
  const hoursUntilDeadline = Math.floor(msUntilDeadline / (1000 * 60 * 60));
  const minutesUntilDeadline = Math.floor(msUntilDeadline / (1000 * 60)) % 60;
  const start = new Date(challenge.startOn);
  const end = new Date(challenge.endOn);
  const totalDays = differenceInCalendarDays(end, start) + 1;
  const daysLeft = Math.max(0, differenceInCalendarDays(end, today));
  const challengeEnded = isAfter(today, end);

  const todaysLogs = summary.filter((item) =>
    item.progress?.entries?.some((entry) => entry.date === todayKey)
  ).length;

  const personalLoggedToday = personal.progress?.entries?.some((entry) => entry.date === todayKey) ?? false;
  const personalRemaining = typeof personal.progress?.remaining === "number" ? personal.progress.remaining : personal.target.targetDeltaKg;
  const absoluteRemaining = Math.max(0, personalRemaining);
  const personalAchieved = personal.progress?.achieved ?? false;
  const personalDelta = personal.progress?.delta ?? 0;
  const penaltyAtRisk = challengeEnded && !personalAchieved;
  const streakText = personalLoggedToday ? "今日已打卡" : "今日尚未记录";
  const riskMembers = summary.filter((item) => !item.achieved);

  const challenges = await listChallenges();
  const history = await Promise.all(
    challenges.slice(0, 4).map(async (item) => {
      if (item.id === challenge.id) {
        return { challenge: item, summary };
      }
      const ctx = await getChallengeContext(item.id);
      return {
        challenge: item,
        summary: ctx ? buildChallengeSummary(ctx) : [],
      };
    })
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_26px_60px_rgba(110,96,85,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,196,153,0.35),transparent),radial-gradient(circle_at_90%_15%,rgba(214,208,255,0.3),transparent)]" />
          <div className="relative flex h-full flex-col gap-6">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-400 sm:text-xs">我的今日重点</p>
              <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{personal.target.userDisplayName}</h1>
              <p className="text-sm text-neutral-500">{challenge.label}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/60 bg-white/85 px-5 py-4 text-sm text-neutral-600">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">今日状态</p>
                <p className="mt-2 text-lg font-semibold text-ink">{streakText}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  最新记录：
                  {personal.progress?.latestEntryDate
                    ? formatDate(personal.progress.latestEntryDate)
                    : "暂无"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/85 px-5 py-4 text-sm text-neutral-600">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">距离目标</p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {personalAchieved ? "目标已达成" : `还差 ${absoluteRemaining.toFixed(1)} kg`}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  目标：-{personal.target.targetDeltaKg.toFixed(1)} kg · 已减：-{Math.max(0, personalDelta).toFixed(1)} kg
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1">
                剩余 {challengeEnded ? "0" : daysLeft} 天 · 今日 {todaysLogs}/3 人已打卡
              </span>
              {penaltyAtRisk ? (
                <span className="rounded-full bg-red-50/80 px-3 py-1 text-red-600">
                  挑战已结束 · 乐捐 70 元待执行
                </span>
              ) : null}
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link
                href="/record"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f3c5a3] via-[#f1d3bd] to-[#d7d0ff] px-6 py-3 text-sm font-semibold text-ink shadow-[0_16px_32px_rgba(156,120,102,0.25)] transition hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(123,101,90,0.35)]"
              >
                立即记录
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_20px_50px_rgba(110,96,85,0.15)] sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">挑战速览</h2>
            <span className="text-xs text-neutral-400">{formatDate(challenge.startOn)} - {formatDate(challenge.endOn)}</span>
          </div>
          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-3">
              <div>
                <span className="block">今日打卡截止</span>
                <span className="text-xs text-neutral-400">逾期自动罚没</span>
              </div>
              <strong className="text-ink">
                {challengeEnded
                  ? "挑战已结束"
                  : `${hoursUntilDeadline.toString().padStart(2, "0")} 小时 ${minutesUntilDeadline
                      .toString()
                      .padStart(2, "0")} 分`}
              </strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-3">
              <span>今日打卡</span>
              <strong className="text-ink">{todaysLogs}/3 完成</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-4 py-3">
              <span>乐捐风险</span>
              <strong className="text-[#a06038]">
                {riskMembers.length === 0
                  ? "暂无"
                  : `${riskMembers.length} 人待达成`}
              </strong>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-xs text-neutral-500">
              <p className="font-medium text-neutral-600">挑战倒计时</p>
              <p className="mt-1 text-neutral-500">
                {challengeEnded ? "挑战已结束" : `距离结算还有 ${daysLeft} 天（共 ${totalDays} 天周期）`}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-500">{challenge.rules}</p>
          <span className="inline-flex w-fit rounded-full bg-[#fcdcc9]/80 px-3 py-1 text-xs font-medium text-[#a06038]">
            {challenge.penalty}
          </span>
        </div>
      </section>

      <section id="team" className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_20px_50px_rgba(110,96,85,0.15)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">团队状态</h2>
          <span className="text-xs text-neutral-400">谁已经完成，谁需要鼓励</span>
        </div>
        <div className="mt-4 space-y-3">
          {[personal, ...teammates].map((member) => {
            const memberLogged = member.progress?.entries?.some((entry) => entry.date === todayKey) ?? false;
            const memberRemaining = typeof member.progress?.remaining === "number"
              ? Math.max(0, member.progress.remaining)
              : member.target.targetDeltaKg;
            const memberAchieved = member.progress?.achieved ?? false;
            const isCurrent = member.target.userId === personal.target.userId;

            return (
              <div
                key={member.target.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-neutral-600"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: member.target.colorHex }}
                  >
                    {member.target.userDisplayName.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-medium text-ink">
                      {member.target.userDisplayName}
                      {isCurrent ? <span className="ml-2 text-xs text-[#a06038]">（我）</span> : null}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {memberAchieved ? "已达成" : `尚差 ${memberRemaining.toFixed(1)} kg`}
                      · {memberLogged ? "今日已打卡" : "今日未打卡"}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    memberAchieved
                      ? "rounded-full bg-[#d9f3e6] px-3 py-1 text-xs text-[#1c8c5d]"
                      : memberLogged
                      ? "rounded-full bg-[#fce6d6] px-3 py-1 text-xs text-[#a06038]"
                      : "rounded-full bg-neutral-200/70 px-3 py-1 text-xs text-neutral-600"
                  }
                >
                  {memberAchieved ? "完成" : memberLogged ? "继续保持" : "待打卡"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 sm:gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_18px_50px_rgba(97,82,73,0.18)] sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">体重趋势</h3>
            <span className="rounded-full bg-neutral-200/60 px-3 py-1 text-xs text-neutral-600">
              最近 7 天
            </span>
          </div>
          <div className="mt-4 h-48 w-full sm:h-72">
            <TrendChart
              series={[
                {
                  label: personal.target.userDisplayName,
                  color: personal.target.colorHex,
                  data: (personal.progress?.entries ?? []).map((entry) => ({
                    date: entry.date,
                    value: entry.weightKg,
                  })),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_18px_50px_rgba(97,82,73,0.18)] sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">挑战历史</h3>
          <span className="text-xs text-neutral-400">最近 {Math.min(history.length, 2)} 次</span>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {history.slice(0, 2).map(({ challenge: item, summary: challengeSummary }) => {
            const achievedCount = challengeSummary.filter((entry) => entry.achieved).length;
            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,195,156,0.15),transparent)]" />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">挑战</p>
                      <p className="text-sm font-semibold text-ink">{item.label}</p>
                    </div>
                    <span className="rounded-full bg-neutral-200/70 px-3 py-1 text-xs text-neutral-600">
                      {formatDate(item.startOn)} — {formatDate(item.endOn)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">完成度：{achievedCount}/3</p>
                  <div className="space-y-2">
                    {challengeSummary.map((entry) => (
                      <div key={entry.target.id} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-neutral-500">
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white"
                            style={{ backgroundColor: entry.target.colorHex }}
                          >
                            {entry.target.userDisplayName.slice(0, 1)}
                          </span>
                          {entry.target.userDisplayName}
                        </span>
                        <span className={entry.achieved ? "text-[#1c8c5d]" : "text-[#a06038]"}>
                          {entry.achieved ? "已完成" : "未完成"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
