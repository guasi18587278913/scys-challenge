"use client";

import { useEffect, useState } from "react";

export function PrizePoolCard({
  poolAmount,
  totalPenalized,
  remainingPool,
  totalMembers,
  loggedToday,
  hoursUntilDeadline,
  minutesUntilDeadline,
  challengeEnded,
}: {
  poolAmount: number;
  totalPenalized: number;
  remainingPool: number;
  totalMembers: number;
  loggedToday: number;
  hoursUntilDeadline: number;
  minutesUntilDeadline: number;
  challengeEnded: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState({ hours: hoursUntilDeadline, minutes: minutesUntilDeadline });

  useEffect(() => {
    if (challengeEnded) return;

    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const msLeft = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(msLeft / (1000 * 60 * 60));
      const minutes = Math.floor(msLeft / (1000 * 60)) % 60;
      setTimeLeft({ hours, minutes });
    }, 60000);

    return () => clearInterval(timer);
  }, [challengeEnded]);

  const notLoggedCount = totalMembers - loggedToday;
  const potentialPenalty = notLoggedCount * 70;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-5 shadow-[0_26px_60px_rgba(110,96,85,0.18)] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,215,0,0.1),transparent),radial-gradient(circle_at_100%_100%,rgba(255,99,71,0.1),transparent)]" />

      <div className="relative space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-orange-700/60">奖金池概览</p>
          <h2 className="mt-1 text-3xl font-bold text-orange-900">¥{remainingPool}</h2>
          <p className="mt-1 text-sm text-orange-700">
            总额 ¥{poolAmount} · 已罚没 ¥{totalPenalized}
          </p>
        </div>

        {!challengeEnded && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-800">今日截止倒计时</p>
                <p className="text-xs text-red-600 mt-1">
                  {notLoggedCount > 0
                    ? `${notLoggedCount} 人未打卡，风险 ¥${potentialPenalty}`
                    : '全员已完成打卡'}
                </p>
              </div>
              <div className="text-2xl font-bold text-red-700 tabular-nums">
                {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs text-neutral-500">今日打卡</p>
            <p className="text-lg font-semibold text-ink">
              {loggedToday}/{totalMembers}
            </p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs text-neutral-500">完成率</p>
            <p className="text-lg font-semibold text-ink">
              {Math.round((loggedToday / totalMembers) * 100)}%
            </p>
          </div>
        </div>

        {challengeEnded && (
          <div className="rounded-xl bg-green-100 border border-green-300 p-3">
            <p className="text-sm font-medium text-green-800">挑战已结束</p>
            <p className="text-xs text-green-600 mt-1">等待最终结算</p>
          </div>
        )}
      </div>
    </div>
  );
}