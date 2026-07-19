"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Speakers() {
  const [showFullBio, setShowFullBio] = useState(false);

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
        <Header showSchedule={true} />

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
                Our Speakers
              </h1>
              <div className="w-20 sm:w-32 h-1 bg-white mx-auto"></div>
            </div>

            <div className="space-y-8">
              {/* Keynote Speaker */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                    Keynote Speaker
                  </h2>

                  <div className="flex flex-col items-center space-y-6">
                    {/* Speaker Photo */}
                    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                      <Image
                        src="/speakers/heidi-schlumpf.jpg"
                        alt="Heidi Schlumpf"
                        width={224}
                        height={224}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Speaker Info */}
                    <div className="text-center">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Heidi Schlumpf
                      </h3>
                      <p className="text-lg sm:text-xl text-white/90 italic">
                        Senior Correspondent, Commonweal Magazine
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="text-left max-w-3xl space-y-4 text-white/90 text-sm sm:text-base leading-relaxed">
                      <p>
                        Heidi Schlumpf is an award-winning journalist and
                        podcaster with three decades of experience covering
                        religion, spirituality as well as political, social and
                        women's issues. She is currently senior correspondent at
                        Commonweal Magazine.
                      </p>

                      <p>
                        Before joining Commonweal, she spent 16 years with the
                        National Catholic Reporter as a columnist, correspondent
                        and executive editor/vice president. She previously
                        served as managing editor of U.S. Catholic magazine and
                        a reporter at Chicago's archdiocesan newspaper. Her work
                        has appeared in Mother Jones, CNN Opinion, Religion News
                        Service, Commonweal and Sojourners magazine. She has
                        made appearances on CNN, NPR, PBS and the New York Times
                        podcast.
                      </p>
                      <p>
                        Schlumpf has been a co-host of the Francis Effect
                        podcast for five years. She also is a part-time faculty
                        member in theology at Loyola University Chicago. She
                        previously taught journalism as an associate professor
                        of communication at Aurora University in Chicago.
                      </p>
                      <p>
                        A graduate of the University of Notre Dame, she also
                        earned a master's of theological studies from Garrett
                        Evangelical Theological Seminary at Northwestern
                        University, where she studied with feminist theologian
                        Rosemary Radford Ruether.
                      </p>
                      <p>
                        She is the author/editor of three books, including{" "}
                        <a
                          href="https://litpress.org/Products/E4842/Elizabeth-Johnson"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold underline hover:text-white/80 transition-colors"
                        >
                          Elizabeth A. Johnson: Questing for God
                        </a>{" "}
                        (Liturgical Press, 2016), the{" "}
                        <a
                          href="https://www.avemariapress.com/products/notre-dame-book-of-prayer"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold underline hover:text-white/80 transition-colors"
                        >
                          Notre Dame Book of Prayer
                        </a>{" "}
                        (Ave Maria, 2010) and{" "}
                        <a
                          href="https://actapublications.com/while-we-wait/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold underline hover:text-white/80 transition-colors"
                        >
                          While We Wait: Spiritual & Practical Advice for Those
                          Trying to Adopt
                        </a>{" "}
                        (ACTA, 2009).
                      </p>
                      <p>
                        Schlumpf is based in Chicago, where she lives with her
                        husband, Edmund, and their two children, and where she
                        is a member of St. Gertrude Parish.
                      </p>

                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-white font-semibold underline hover:text-white/80 transition-colors pt-2"
                      >
                        {showFullBio ? "Show Less" : "Show More"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakout Session Speakers - Coming Soon */}
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                    Breakout Session Speaker Lineup Coming Soon
                  </h2>

                  <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                    We're excited to announce our distinguished speakers and
                    panelists who will share their insights on reclaiming truth
                    and social justice. Check back soon for updates.
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
                      <Link
                        href="/dashboard"
                        className="bg-white text-black hover:bg-white/90 font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl"
                      >
                        Go to Dashboard
                      </Link>
                    </SignedIn>
                  </div>
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
