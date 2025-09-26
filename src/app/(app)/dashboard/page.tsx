import { format, differenceInCalendarDays, isAfter } from "date-fns";
import Link from "next/link";
import { TrendChart } from "@/components/trend-chart";
import { PrizePoolCard } from "@/components/prize-pool-card";
import {
  buildChallengeSummary,
  getChallengeContext,
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
  const challenge = context.challenge;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
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
  );

  const poolAmount = challenge.poolAmount || 210;
  const penaltyAmount = challenge.penaltyAmount || 70;
  const totalPenaltyRisk = summary.filter(s => !s.achieved).length * penaltyAmount;
  const totalPenalized = summary.filter(s => s.target.penaltyStatus === 'COMPLETED').length * penaltyAmount;

  const sortedByWeight = [...summary].sort((a, b) => {
    const aLatest = a.progress?.entries?.[a.progress.entries.length - 1]?.weightKg || 999;
    const bLatest = b.progress?.entries?.[b.progress.entries.length - 1]?.weightKg || 999;
    return aLatest - bLatest;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
        <PrizePoolCard
          poolAmount={poolAmount}
          totalPenalized={totalPenalized}
          remainingPool={poolAmount - totalPenalized}
          totalMembers={summary.length}
          loggedToday={todaysLogs.length}
          hoursUntilDeadline={hoursUntilDeadline}
          minutesUntilDeadline={minutesUntilDeadline}
          challengeEnded={challengeEnded}
        />

        <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_20px_50px_rgba(110,96,85,0.15)] sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">实时排行榜</h2>
            <span className="text-xs text-neutral-400">按当前体重排序</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left pb-2 font-medium text-neutral-600">排名</th>
                  <th className="text-left pb-2 font-medium text-neutral-600">成员</th>
                  <th className="text-center pb-2 font-medium text-neutral-600">当前体重</th>
                  <th className="text-center pb-2 font-medium text-neutral-600">累计下降</th>
                  <th className="text-center pb-2 font-medium text-neutral-600">今日状态</th>
                  <th className="text-right pb-2 font-medium text-neutral-600">风险金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sortedByWeight.map((member, index) => {
                  const latestEntry = member.progress?.entries?.[member.progress.entries.length - 1];
                  const firstEntry = member.progress?.entries?.[0];
                  const totalDelta = latestEntry && firstEntry ? firstEntry.weightKg - latestEntry.weightKg : 0;
                  const hasLoggedToday = member.progress?.entries?.some((entry) => entry.date === todayKey) ?? false;
                  const isAtRisk = !member.achieved && !hasLoggedToday;

                  return (
                    <tr key={member.target.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 text-neutral-600">#{index + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: member.target.colorHex }}
                          >
                            {member.target.userDisplayName.slice(0, 1)}
                          </span>
                          <span className="font-medium text-ink">{member.target.userDisplayName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center font-medium">
                        {latestEntry ? `${latestEntry.weightKg.toFixed(1)} kg` : '-'}
                      </td>
                      <td className="py-3 text-center">
                        {totalDelta > 0 ? (
                          <span className="text-green-600">-{totalDelta.toFixed(1)} kg</span>
                        ) : totalDelta < 0 ? (
                          <span className="text-red-600">+{Math.abs(totalDelta).toFixed(1)} kg</span>
                        ) : (
                          <span className="text-neutral-400">0 kg</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {member.achieved ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">已达成</span>
                        ) : hasLoggedToday ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">已打卡</span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">待打卡</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isAtRisk ? (
                          <span className="font-medium text-red-600">¥{penaltyAmount}</span>
                        ) : member.target.penaltyStatus === 'COMPLETED' ? (
                          <span className="text-neutral-400 line-through">¥{penaltyAmount}</span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_18px_50px_rgba(97,82,73,0.18)] sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink">今日罚没日志</h3>
            <span className="text-xs text-neutral-400">{formatDate(todayKey)}</span>
          </div>

          <div className="space-y-3">
            {summary.filter(s => !s.progress?.entries?.some(e => e.date === todayKey)).length === 0 ? (
              <p className="text-sm text-neutral-500">今日暂无罚没记录</p>
            ) : (
              summary.filter(s => !s.progress?.entries?.some(e => e.date === todayKey)).map((member) => (
                <div key={member.target.id} className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                      style={{ backgroundColor: member.target.colorHex }}
                    >
                      {member.target.userDisplayName.slice(0, 1)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{member.target.userDisplayName}</p>
                      <p className="text-xs text-red-600">未按时打卡</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-700">-¥{penaltyAmount}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_18px_50px_rgba(97,82,73,0.18)] sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink">最近7日体重记录</h3>
            <span className="text-xs text-neutral-400">所有成员</span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {summary.map((member) => {
              const recentEntries = (member.progress?.entries || [])
                .slice(-7)
                .map(e => ({ date: formatDate(e.date), weight: e.weightKg.toFixed(1), hasPhoto: !!e.photoPath }));

              return (
                <details key={member.target.id} className="group">
                  <summary className="flex items-center justify-between cursor-pointer rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 hover:bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                        style={{ backgroundColor: member.target.colorHex }}
                      >
                        {member.target.userDisplayName.slice(0, 1)}
                      </span>
                      <span className="text-sm font-medium">{member.target.userDisplayName}</span>
                    </div>
                    <svg className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 px-4 py-2 text-xs text-neutral-600">
                    {recentEntries.length === 0 ? (
                      <p className="text-neutral-400">暂无记录</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {recentEntries.map((entry, idx) => (
                          <div key={idx} className="text-center">
                            <p className="font-medium">{entry.date}</p>
                            <p className="text-neutral-700">{entry.weight} kg</p>
                            <p className="text-neutral-400">{entry.hasPhoto ? '有照片' : '无照片'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_18px_50px_rgba(97,82,73,0.18)] sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ink">挑战进度总览</h3>
          <span className="text-xs text-neutral-400">
            第 {totalDays - daysLeft} / {totalDays} 天
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-wider text-neutral-400">总参与人数</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{summary.length}</p>
            <p className="mt-1 text-xs text-neutral-500">全员参与</p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-wider text-neutral-400">今日完成率</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {Math.round((todaysLogs.length / summary.length) * 100)}%
            </p>
            <p className="mt-1 text-xs text-neutral-500">{todaysLogs.length}/{summary.length} 人已打卡</p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-wider text-neutral-400">累计罚没</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">¥{totalPenalized}</p>
            <p className="mt-1 text-xs text-neutral-500">风险: ¥{totalPenaltyRisk}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-neutral-100/70 p-4">
          <p className="text-sm font-medium text-neutral-700 mb-2">挑战规则提醒</p>
          <p className="text-xs text-neutral-600">{challenge.rules}</p>
          <p className="mt-2 text-xs text-neutral-500">罚则: {challenge.penalty}</p>
        </div>
      </div>
    </div>
  );
}