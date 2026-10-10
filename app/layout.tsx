import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteModeProvider } from "@/components/SiteMode";
import { isFullSiteEnabled } from "@/lib/siteMode";
import "./globals.css";

export const metadata: Metadata = {
  title: "Social Justice Institute - Caldwell University",
  description: "",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="overflow-auto">
          <SiteModeProvider isFullSite={isFullSiteEnabled()}>
            {children}
          </SiteModeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
