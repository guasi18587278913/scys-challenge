import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { buildChallengeSummary, getChallengeContext } from "@/lib/data-service";

export default async function TeamLogPage({
  params,
  searchParams,
}: {
  params: Promise<{ challengeId: string }>;
  searchParams?: Promise<{ member?: string; date?: string }>;
}) {
  const { challengeId } = await params;
  const query = (await searchParams) ?? {};
  const filterMember = query.member;
  const filterDate = query.date;

  const context = await getChallengeContext(challengeId);
  if (!context) {
    notFound();
  }

  const challenge = context.challenge;
  const summary = buildChallengeSummary(context);
  const members = summary.map((item) => ({
    id: item.target.userId,
    name: item.target.userDisplayName,
    color: item.target.colorHex,
  }));

  const logs = summary
    .flatMap((member) =>
      (member.progress?.entries ?? []).map((entry) => ({
        memberId: member.target.userId,
        memberName: member.target.userDisplayName,
        color: member.target.colorHex,
        entry,
      }))
    )
    .sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime());

  const filteredLogs = logs
    .filter((log) => (filterMember ? log.memberId === filterMember : true))
    .filter((log) => (filterDate ? log.entry.date.slice(0, 10) === filterDate : true));

  const grouped = filteredLogs.reduce<Record<string, typeof filteredLogs>>((acc, log) => {
    const key = log.entry.date.slice(0, 10);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(log);
    return acc;
  }, {});

  const orderedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const latestDates = orderedDates.slice(0, 14);

  const activeMember = filterMember ? members.find((m) => m.id === filterMember)?.name ?? "全部成员" : "全部成员";
  const activeDate = filterDate ?? "全部日期";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">团队日志</p>
          <h1 className="text-3xl font-semibold text-ink">{challenge.label}</h1>
          <p className="text-sm text-neutral-500">
            {format(new Date(challenge.startOn), "MM月dd日")} — {format(new Date(challenge.endOn), "MM月dd日")}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-neutral-600 transition hover:text-ink"
        >
          返回主页
        </Link>
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/60 bg-white/75 p-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">查看成员：</span>
          <Link
            href={`/team-log/${challengeId}`}
            className={`rounded-full px-3 py-1 ${filterMember ? "border border-white/50" : "bg-ink text-white"}`}
          >
            全部
          </Link>
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/team-log/${challengeId}?member=${member.id}${filterDate ? `&date=${filterDate}` : ""}`}
              className={`rounded-full px-3 py-1 ${filterMember === member.id ? "bg-ink text-white" : "border border-white/50"}`}
            >
              {member.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">日期：</span>
          <Link
            href={`/team-log/${challengeId}${filterMember ? `?member=${filterMember}` : ""}`}
            className={`rounded-full px-3 py-1 ${filterDate ? "border border-white/50" : "bg-ink text-white"}`}
          >
            全部
          </Link>
          {latestDates.map((date) => {
            const href = `/team-log/${challengeId}?date=${date}${filterMember ? `&member=${filterMember}` : ""}`;
            const active = filterDate === date;
            return (
              <Link
                key={date}
                href={href}
                className={`rounded-full px-3 py-1 ${active ? "bg-ink text-white" : "border border-white/50"}`}
              >
                {format(new Date(date), "MM月dd日")}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-white/60 bg-white/75 p-4 text-sm text-neutral-500">
          <p>
            当前筛选：<span className="text-ink">{activeMember}</span> · <span className="text-ink">{activeDate}</span>
          </p>
          <p className="mt-1 text-xs text-neutral-400">默认展示最近 14 天，可点击成员或日期快速切换。</p>
        </div>

        {latestDates.length === 0 ? (
          <div className="rounded-3xl border border-white/60 bg-white/75 p-8 text-center text-neutral-500">
            暂无打卡记录，去提醒一下队友吧！
          </div>
        ) : (
          latestDates.map((date) => {
            const logsForDate = grouped[date];
            const formattedDate = format(new Date(date), "MM月dd日 EEE");
            return (
              <div
                key={date}
                className="space-y-4 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_20px_50px_rgba(110,96,85,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ink">{formattedDate}</h2>
                  <span className="text-xs text-neutral-400">{logsForDate.length} 条记录</span>
                </div>
                <div className="space-y-3">
                  {logsForDate.map((log) => {
                    const entry = log.entry;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm text-neutral-600"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                              style={{ backgroundColor: log.color }}
                            >
                              {log.memberName.slice(0, 1)}
                            </span>
                            <span className="font-medium text-ink">{log.memberName}</span>
                          </span>
                          <span className="text-xs text-neutral-400">
                            体重 {entry.weightKg.toFixed(1)} kg
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                          {entry.photoShared && entry.photoPath ? (
                            <a
                              href={entry.photoPath}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-ink"
                            >
                              查看秤面照片
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
