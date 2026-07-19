"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  showSchedule?: boolean;
}

const navLinks = [
  { href: "/schedule", label: "Schedule" },
  { href: "/speakers", label: "Speakers" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/community-partners", label: "Community Partners" },
];

export default function Header({ showSchedule = true }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      // Always show near the top of the page
      if (currentScrollY < 16) {
        setIsVisible(true);
      } else if (Math.abs(delta) > 4) {
        // Hide on scroll down, show on scroll up
        setIsVisible(delta < 0);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keep header visible while the mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) setIsVisible(true);
  }, [isMobileMenuOpen]);

  const linkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return [
      "relative text-sm lg:text-base font-medium tracking-wide whitespace-nowrap transition-colors duration-200",
      "after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:bg-white after:transition-transform after:duration-200",
      isActive
        ? "text-white after:scale-x-100"
        : "text-white/70 hover:text-white after:scale-x-0 hover:after:scale-x-100",
    ].join(" ");
  };

  const showHeader = isVisible || isMobileMenuOpen;

  return (
    <div
      className={[
        "fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-sm border-b border-white/10",
        "transition-transform duration-300 ease-out will-change-transform",
        showHeader ? "translate-y-0" : "-translate-y-full",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Left Side */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo_white.png"
              alt="Social Justice Institute"
              width={200}
              height={200}
              className="object-contain w-[60px] h-[60px] sm:w-[100px] sm:h-[100px]"
            />
          </button>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons - Right Side */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 lg:px-6 rounded-lg border border-white/20 transition-all duration-200 text-sm lg:text-base whitespace-nowrap">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 lg:px-6 rounded-lg border border-white/20 transition-all duration-200 text-sm lg:text-base whitespace-nowrap"
              >
                Dashboard
              </a>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-10 sm:h-10",
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-white/10">
            <nav className="flex flex-col">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={[
                      "px-1 py-3 text-sm font-medium tracking-wide border-b border-white/10 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/70 hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <SignedOut>
              <div className="pt-3 space-y-2">
                <SignInButton mode="modal">
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-white/20 transition-all duration-200 text-sm">
                    Sign In
                  </button>
                </SignInButton>
                <a
                  href="mailto:sji@caldwell.edu"
                  className="block w-full bg-white text-black hover:bg-white/90 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm text-center"
                >
                  Registration Closed
                </a>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="pt-3 space-y-2">
                <a
                  href="/dashboard"
                  className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-white/20 transition-all duration-200 text-sm text-center"
                >
                  Dashboard
                </a>
                <div className="flex justify-center pt-2">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      },
                    }}
                  />
                </div>
              </div>
            </SignedIn>
          </div>
        )}
      </div>
    </div>
  );
}
