import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/auth";
import { NavTabs } from "@/components/nav-tabs";
import { LogoutButton } from "@/components/logout-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "主页" },
  { href: "/record", label: "记录" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const currentUser = await findUserById(session.userId);

  if (!currentUser) {
    redirect("/login");
  }

  const initials = currentUser.displayName.slice(0, 1);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-14 pt-4 sm:px-6 lg:px-8">
      <header className="sticky top-4 z-30 flex flex-col gap-3 rounded-3xl border border-white/50 bg-white/80 px-4 py-3 shadow-[0_18px_40px_rgba(117,100,90,0.18)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-full sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-base font-semibold text-white shadow-[0_8px_18px_rgba(46,36,32,0.35)]"
            aria-label="返回仪表盘"
          >
            SC
          </Link>
          <div className="leading-snug">
            <p className="text-sm font-semibold text-ink">SCYS 减脂挑战</p>
            <p className="hidden text-xs text-neutral-500 sm:block">轻盈、透明、彼此负责的周度管理</p>
          </div>
        </div>

        <div className="-mx-1 w-full overflow-x-auto pb-1 sm:mx-0 sm:flex sm:flex-1 sm:justify-center sm:overflow-visible">
          <NavTabs items={NAV_ITEMS} />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-neutral-500 sm:w-auto">
          <Link
            href="/dashboard#team"
            className="hidden rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-neutral-500 transition hover:text-ink sm:inline-flex"
          >
            团队状态
          </Link>
          <div className="flex flex-1 items-center justify-between gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-2 sm:flex-none">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: currentUser.colorHex }}
            >
              {initials}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium text-ink">{currentUser.displayName}</p>
              <p className="text-[11px] text-neutral-500">欢迎回来</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mt-6 flex-1 sm:mt-8" id="content">
        {children}
      </main>
    </div>
  );
}
