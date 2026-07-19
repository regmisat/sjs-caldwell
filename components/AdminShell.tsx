"use client";

import type { ReactNode } from "react";
import Header from "@/components/Header";
import AdminNav from "@/components/AdminNav";

interface AdminShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export default function AdminShell({
  children,
  title,
  description,
  actions,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSchedule={false} />

      <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:px-8">
        <AdminNav />

        {(title || actions) && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
