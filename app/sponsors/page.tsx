"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "@/components/Footer";

export default function Partners() {
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
        <Header showSchedule={true} />

        {/* add sister of st domonics, put all under event sponsor */}

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
                Our Sponsors
              </h1>
              <div className="w-20 sm:w-32 h-1 bg-white mx-auto"></div>
            </div>

            {/* Sponsors */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <Image
                  src="/sponsors/pseg.jpg"
                  alt="PSEG"
                  width={150}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <Image
                  src="/sponsors/sisters-of-st-dominic.png"
                  alt="Sisters of St. Dominic"
                  width={150}
                  height={80}
                  className="object-contain"
                />
              </div>

              <div className="bg-white rounded-lg p-4 shadow-lg">
                <Image
                  src="/sponsors/EJMC.png"
                  alt="Eileen Jones Multicultural Center"
                  width={150}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <a
                href="mailto:sji@caldwell.edu"
                className="inline-block bg-white text-black hover:bg-white/90 font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
