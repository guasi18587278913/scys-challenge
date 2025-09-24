"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type NavItem = {
  href: string;
  label: string;
};

export function NavTabs({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 rounded-full border border-white/40 bg-white/50 p-1 backdrop-blur">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-medium transition",
              isActive
                ? "bg-ink text-white shadow-[0_8px_16px_rgba(65,52,45,0.25)]"
                : "text-neutral-600 hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
