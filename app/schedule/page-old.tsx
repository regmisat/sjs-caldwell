"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Footer from "@/components/Footer";

export default function Schedule() {
  const router = useRouter();

  return (
    <>
      <div className="relative max-w-screen min-h-screen">
        {/* Background Image */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/caldwell.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>

        {/* Header Navigation */}
        <Header showSchedule={false} />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen py-24 sm:py-28 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="mx-auto mb-8 sm:mb-12">
              <Image
                src="/logo_white.png"
                alt="Social Justice Institute"
                width={150}
                height={150}
                className="object-contain mx-auto sm:w-[200px]"
              />
            </div>

            {/* Heading */}
            <div className="mb-12 sm:mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-4 font-serif">
                Event Schedule
              </h1>
              <div className="w-20 sm:w-32 h-1 bg-white mx-auto"></div>
            </div>

            {/* Coming Soon Message */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/20 shadow-2xl">
              <div className="space-y-6">
                <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                  Schedule Coming Soon
                </h2>

                <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                  We're working hard to finalize the event schedule. Check back
                  soon for detailed information about sessions, speakers, and
                  activities.
                </p>

                <div className="pt-6">
                  <p className="text-lg sm:text-xl font-semibold text-white">
                    Friday, February 27, 2026
                  </p>
                  <p className="text-sm sm:text-base text-white/70 mt-2">
                    Caldwell University's 5th Annual Social Justice Symposium
                  </p>
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <SignedOut>
                    <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                      <button className="bg-white text-black hover:bg-white/90 font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl">
                        Register for Updates
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="bg-white text-black hover:bg-white/90 font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl"
                    >
                      Go to Dashboard
                    </button>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
