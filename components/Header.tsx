"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  showSchedule?: boolean;
}

export default function Header({ showSchedule = true }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-sm border-b border-white/10">
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
          <div className="hidden md:flex items-center gap-3 lg:gap-4 absolute left-1/2 transform -translate-x-1/2">
            {/* Navigation Links */}
            <>
              <Link
                href="/schedule"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 lg:px-6 rounded-lg border border-white/20 transition-all duration-200 text-sm lg:text-base whitespace-nowrap"
              >
                Schedule
              </Link>
              <Link
                href="/speakers"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 lg:px-6 rounded-lg border border-white/20 transition-all duration-200 text-sm lg:text-base whitespace-nowrap"
              >
                Speakers
              </Link>
              <Link
                href="/sponsors"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 lg:px-6 rounded-lg border border-white/20 transition-all duration-200 text-sm lg:text-base whitespace-nowrap"
              >
                Sponsors
              </Link>
              <Link
                href="/community-partners"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 lg:px-6 rounded-lg border border-white/20 transition-all duration-200 text-sm lg:text-base whitespace-nowrap"
              >
                Community Partners
              </Link>
            </>
          </div>

          {/* Desktop Auth Buttons - Right Side */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {/* Auth Buttons */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 lg:px-6 rounded-lg border border-white/20 transition-all duration-200 text-sm lg:text-base whitespace-nowrap">
                  Sign In
                </button>
              </SignInButton>
              {/* <a
                href="mailto:sji@caldwell.edu"
                className="bg-white text-black hover:bg-white/90 font-semibold py-2 px-4 lg:px-6 rounded-lg transition-all duration-200 text-sm lg:text-base whitespace-nowrap"
              >
                Registration Closed
              </a> */}
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
          <div className="md:hidden py-4 space-y-2 border-t border-white/10">
            <>
              <Link
                href="/schedule"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-white/20 transition-all duration-200 text-sm text-center"
              >
                Schedule
              </Link>
              <Link
                href="/speakers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-white/20 transition-all duration-200 text-sm text-center"
              >
                Speakers
              </Link>
              <Link
                href="/sponsors"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-white/20 transition-all duration-200 text-sm text-center"
              >
                Sponsors
              </Link>
              <Link
                href="/community-partners"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-white/20 transition-all duration-200 text-sm text-center"
              >
                Community Partners
              </Link>
            </>
            <SignedOut>
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
            </SignedOut>
            <SignedIn>
              <a
                href="/dashboard"
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg border border-white/20 transition-all duration-200 text-sm"
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
            </SignedIn>
          </div>
        )}
      </div>
    </div>
  );
}
