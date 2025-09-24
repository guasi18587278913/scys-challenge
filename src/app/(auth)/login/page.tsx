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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[12%] h-40 w-40 rounded-full bg-[#fbd1b4] blur-3xl opacity-60" />
        <div className="absolute right-[8%] top-[18%] h-48 w-48 rounded-full bg-[#d6d0ff] blur-[120px] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-[#f4ede6]/90 to-[#efe9ff]/90" />
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
        <div className="max-w-sm space-y-6 text-center lg:text-left">
          <p className="inline-flex rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.4em] text-neutral-500">
            Weekly Balance
          </p>
          <h2 className=" text-4xl font-semibold leading-tight text-ink">
            三人同行的轻盈计划
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            每日体重记录、周度目标追踪和惩罚提醒，都收纳在这个私密的仪表盘里。简单登录即可同步进度，保持节奏。
          </p>
          <ul className="space-y-3 text-sm text-neutral-500">
            <li>· 私密数据，仅 3 人可见</li>
            <li>· 自动结算周目标与乐捐状态</li>
            <li>· 折线趋势 + 进度条状态，一眼掌握</li>
          </ul>
        </div>
        <Suspense fallback={<div className="h-96 w-full max-w-md rounded-3xl bg-white/50" />}>
          <LoginForm users={users} redirectTo={redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}
