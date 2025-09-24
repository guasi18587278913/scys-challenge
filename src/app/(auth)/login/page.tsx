import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { getAllUsers } from "@/lib/auth";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const users = await getAllUsers();
  const params = (await searchParams) ?? {};
  const redirectParam = params.redirect;
  const redirectTo = typeof redirectParam === "string" ? redirectParam : undefined;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[6%] top-[10%] h-36 w-36 rounded-full bg-[#fbd1b4] blur-3xl opacity-60 sm:left-[10%] sm:h-40 sm:w-40" />
        <div className="absolute right-[4%] top-[14%] h-40 w-40 rounded-full bg-[#d6d0ff] blur-[100px] opacity-70 sm:right-[8%] sm:h-48 sm:w-48" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-[#f4ede6]/90 to-[#efe9ff]/90" />
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col-reverse items-center gap-8 lg:flex-row lg:items-start lg:gap-16">
        <div className="max-w-sm space-y-5 text-center lg:text-left">
          <p className="inline-flex rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.4em] text-neutral-500 sm:px-4 sm:py-2 sm:text-xs">
            Weekly Balance
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            三人同行的轻盈计划
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">
            每天两分钟，称重 + 拍照即可守住奖金池。自动计算罚没与分配，让挑战轻松又有仪式感。
          </p>
          <ul className="space-y-3 text-sm text-neutral-500">
            <li>· 私密房间，记录只在团队内部可见</li>
            <li>· 每日打卡守住奖金池，缺卡自动罚没</li>
            <li>· 周末一键结算，数据图表随时回顾</li>
          </ul>
        </div>
        <Suspense fallback={<div className="h-96 w-full max-w-md rounded-3xl bg-white/50" />}>
          <LoginForm users={users} redirectTo={redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}
