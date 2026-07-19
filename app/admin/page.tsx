import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  Calendar,
  Mic2,
  Users,
  CreditCard,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_EMAILS } from "@/utils/CONSTANTS";
import AdminShell from "@/components/AdminShell";

const sections: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Sessions",
    description: "Create and edit event sessions, capacity, and speakers.",
    href: "/admin/sessions",
    icon: Calendar,
  },
  {
    title: "Speakers",
    description: "Manage speaker profiles, photos, and keynote status.",
    href: "/admin/speakers",
    icon: Mic2,
  },
  {
    title: "Users",
    description: "Search registrants, update payment status, and check in.",
    href: "/admin/users",
    icon: Users,
  }
];

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="mb-2 text-2xl font-semibold text-red-600">
          Access Denied
        </h1>
        <p className="text-gray-600">
          This page is only accessible to authorized administrators.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <AdminShell
      title="Admin Dashboard"
      description="Manage sessions, speakers, registrations, and payments."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-700" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {section.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {section.description}
              </p>
            </Link>
          );
        })}
      </div>
    </AdminShell>
  );
}
