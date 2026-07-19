"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Mic2,
  Users,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

const adminPages: {
  title: string;
  href: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
}[] = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    match: (pathname) => pathname === "/admin",
  },
  {
    title: "Sessions",
    href: "/admin/sessions",
    icon: Calendar,
  },
  {
    title: "Speakers",
    href: "/admin/speakers",
    icon: Mic2,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  }
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 border-b border-gray-200">
      <div className="-mb-px flex gap-1 overflow-x-auto">
        {adminPages.map((page) => {
          const isActive = page.match
            ? page.match(pathname)
            : pathname === page.href || pathname.startsWith(`${page.href}/`);
          const Icon = page.icon;

          return (
            <Link
              key={page.href}
              href={page.href}
              className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {page.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
