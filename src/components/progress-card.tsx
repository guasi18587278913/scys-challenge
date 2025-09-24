import { format } from "date-fns";

function formatNumber(value?: number, fallback = "-") {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return value.toFixed(1);
}

export function ProgressCard({
  name,
  color,
  targetKg,
  deltaKg,
  remainingKg,
  achieved,
  latestEntryDate,
  todayLogged,
}: {
  name: string;
  color: string;
  targetKg: number;
  deltaKg?: number;
  remainingKg?: number;
  achieved: boolean;
  latestEntryDate?: string;
  todayLogged: boolean;
}) {
  const progressPercent = targetKg > 0 && typeof deltaKg === "number"
    ? Math.max(0, Math.min(1, deltaKg / targetKg))
    : 0;

  const displayRemaining = () => {
    if (typeof deltaKg !== "number") {
      return "未有起始记录";
    }
    if (achieved) {
      return "目标已完成";
    }
    if (deltaKg < 0) {
      return `较起点 +${Math.abs(deltaKg).toFixed(1)} kg`;
    }
    const remaining = typeof remainingKg === "number" ? Math.max(0, remainingKg) : targetKg - deltaKg;
    return `还差 ${remaining.toFixed(1)} kg`;
  };

  const latestDateLabel = latestEntryDate ? format(new Date(latestEntryDate), "MM月dd日") : "尚无记录";

  return (
    <div className="relative flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_18px_45px_rgba(97,82,73,0.16)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white" style={{ backgroundColor: color }}>
            {name.slice(0, 1)}
          </span>
          <div>
            <h3 className="text-base font-semibold text-ink">{name}</h3>
            <p className="text-xs text-neutral-500">周目标 {formatNumber(targetKg)} kg</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            achieved ? "bg-[#3fb27f]/20 text-[#1c8c5d]" : todayLogged ? "bg-[#fcdcc9]/60 text-[#a06038]" : "bg-neutral-200/70 text-neutral-600"
          }`}
        >
          {achieved ? "已完成" : todayLogged ? "今日已打卡" : "待打卡"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-neutral-500">当前减重</p>
            <p className="text-2xl font-semibold text-ink">
              {typeof deltaKg === "number" ? `${deltaKg >= 0 ? "-" : "+"}${Math.abs(deltaKg).toFixed(1)} kg` : "-"}
            </p>
          </div>
          <p className="text-xs text-neutral-500">最新记录：{latestDateLabel}</p>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-200/60">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${progressPercent * 100}%`,
              background: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.9) 100%)`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">{displayRemaining()}</span>
        <span className="text-neutral-400">目标 {targetKg.toFixed(1)} kg</span>
      </div>
    </div>
  );
}
