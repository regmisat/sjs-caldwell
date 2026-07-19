"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminPages = [
  {
    title: "Manage Sessions",
    href: "/admin/sessions",
    icon: "📅",
  },
  {
    title: "Manage Speakers",
    href: "/admin/speakers",
    icon: "🎤",
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: "👥",
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {adminPages.map((page) => {
        const isActive = pathname === page.href;
        return (
          <Link key={page.href} href={page.href}>
            <div
              className={`flex items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                  : "bg-white border-gray-200 text-gray-800 hover:border-gray-400 hover:shadow-md"
              }`}
            >
              <span className="text-3xl">{page.icon}</span>
              <span className="text-lg font-semibold">{page.title}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
