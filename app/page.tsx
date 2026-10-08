"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddToCalendar from "../components/AddToCalendar";
import Header from "../components/Header";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SignInButton, SignedOut, SignedIn } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { ArrowRight, Images, Maximize2 } from "lucide-react";

// Array of background images
const backgroundImages = [
  "/event-pics/IMG_8812.jpg",
  "/event-pics/IMG_8898.jpg",
  "/event-pics/IMG_8953.jpg",
  "/event-pics/IMG_8996.jpg",
  "/event-pics/IMG_9059.jpg",
  "/event-pics/IMG_9092.jpg",
  "/event-pics/IMG_9110.jpg",
  "/event-pics/IMG_9032.jpg",
  "/event-pics/IMG_8977.jpg",
];

// Bento layout for the highlights gallery (6-col grid on lg):
// a 2x2 feature top-left, a row of three, then a 2x2 feature bottom-right.
const galleryLayout = [
  "col-span-2 lg:col-span-4 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-4 lg:row-span-2 lg:col-start-3 lg:row-start-4",
];

const EVENT_START_TIME = new Date("2026-02-27T09:00:00-05:00").getTime();

export default function Home() {
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [countdownEnded, setCountdownEnded] = useState(false);

  useEffect(() => {
    const updateCountdownStatus = () => {
      setCountdownEnded(Date.now() >= EVENT_START_TIME);
    };

    updateCountdownStatus();

    if (Date.now() >= EVENT_START_TIME) return;

    const timer = setInterval(updateCountdownStatus, 1000);
    return () => clearInterval(timer);
  }, []);

  const slides = backgroundImages.map((src, index) => ({
    src,
    alt: `Social Justice Symposium highlight ${index + 1}`,
  }));

  return (
    <div className="dark relative max-w-screen min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
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

      {/* Hero Section - Full viewport height */}
      <section className="relative z-10 h-[800px] grid place-content-center px-4 mt-40 md:mt-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/logo_white.png"
              alt="Social Justice Institute"
              width={300}
              height={300}
              className="object-contain w-[200px] sm:w-[250px] lg:w-[300px]"
            />
          </div>
          <div
            className={`flex flex-wrap justify-center gap-8 lg:gap-16 ${
              countdownEnded ? "items-center" : "items-start"
            }`}
          >
            {/* Text Content */}
            <div
              className={`space-y-4 sm:space-y-6 ${
                countdownEnded
                  ? "text-center max-w-3xl mx-auto"
                  : "text-center lg:text-left"
              }`}
            >
              {/* Event Title */}
              <div className="mb-3 sm:mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white/90 tracking-wide">
                  Caldwell University's 5th Annual
                </h1>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-1">
                  Social Justice Symposium
                </h2>
              </div>

              {/* Reclaim Truth Heading */}
              <div className="mb-4 sm:mb-8">
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight font-serif">
                  RE:Claim Truth
                </h2>
                <div
                  className={`w-16 sm:w-24 h-1 bg-white mt-3 sm:mt-4 ${
                    countdownEnded ? "mx-auto" : "lg:mx-0 mx-auto"
                  }`}
                ></div>
                {countdownEnded && (
                  <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-white mt-5 sm:mt-6">
                    Friday, February 27, 2026
                  </p>
                )}
              </div>

              <div className="mt-10 sm:mt-20">
                <p className="text-white text-lg sm:text-xl font-semibold max-w-xl">
                  We are SOLD OUT and registration is now closed! If you have
                  questions, please email us at{" "}
                  <a
                    href="mailto:sji@caldwell.edu"
                    className="underline hover:text-white/80 transition-colors"
                  >
                    sji@caldwell.edu
                  </a>
                  .
                </p>

                <div className="mt-6">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="bg-white text-black hover:bg-white/90 font-semibold py-3 px-8 sm:px-12 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>

                  <SignedIn>
                    <a
                      href="/dashboard"
                      className="bg-white text-black hover:bg-white/90 font-semibold py-3 px-8 sm:px-12 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl"
                    >
                      Go to Dashboard
                    </a>
                    <p className="text-white text-sm mt-4">
                      View your event details and QR code
                    </p>
                  </SignedIn>
                </div>
              </div>
            </div>

            {!countdownEnded && (
              <div>
                <div className="md:inline-block block">
                  <p className="text-sm sm:text-base md:text-lg font-medium text-white/90 tracking-wider uppercase text-center">
                    Save the Date
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-white">
                    Friday, February 27, 2026
                  </p>
                </div>

                <CountdownTimer />

                {/* Calendar Buttons */}
                <AddToCalendar />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Information Cards Section */}
      <div className="relative z-10 max-w-6xl mx-auto mt-16 px-4 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* View Schedule Card */}
          <div
            onClick={() => router.push("/schedule")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-300">
                <svg
                  className="w-12 h-12 text-white"
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
              <h3 className="text-2xl font-bold text-white">View Schedule</h3>
              <p className="text-white/80 text-sm">
                Explore the full event schedule and sessions
              </p>
              <div className="text-white/60 group-hover:text-white transition-all duration-300">
                <svg
                  className="w-6 h-6 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* View Speakers Card */}
          <div
            onClick={() => router.push("/speakers")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-300">
                <svg
                  className="w-12 h-12 text-white"
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
              <h3 className="text-2xl font-bold text-white">View Speakers</h3>
              <p className="text-white/80 text-sm">
                Meet our inspiring speakers and panelists
              </p>
              <div className="text-white/60 group-hover:text-white transition-all duration-300">
                <svg
                  className="w-6 h-6 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Partners Card */}
          <div
            onClick={() => router.push("/sponsors")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-300">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Sponsors</h3>
              <p className="text-white/80 text-sm">
                Discover our valued sponsors
              </p>
              <div className="text-white/60 group-hover:text-white transition-all duration-300">
                <svg
                  className="w-6 h-6 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Past Event Pictures Section */}
      <section
        aria-labelledby="highlights-heading"
        className="relative z-10 max-w-6xl mx-auto mt-24 px-4 pb-16"
      >
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              <span className="h-px w-8 bg-white/50" />
              From the Archive
            </p>
            <h2
              id="highlights-heading"
              className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white font-serif"
            >
              Past Event Highlights
            </h2>
            <p className="mt-3 max-w-md text-white/70 text-sm sm:text-base">
              Memories from our previous Social Justice Symposiums
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
            className="group inline-flex items-center gap-2 self-start sm:self-auto shrink-0 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Images className="h-4 w-4" />
            View all {backgroundImages.length} photos
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 lg:auto-rows-[15rem] gap-3 sm:gap-4">
          {backgroundImages.map((imageSrc, index) => {
            const isFeature = galleryLayout[index]?.includes("row-span-2");
            return (
              <button
                key={imageSrc}
                type="button"
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
                aria-label={`Open photo ${index + 1} of ${backgroundImages.length}`}
                className={`group relative aspect-[3/2] lg:aspect-auto overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 shadow-lg shadow-black/30 transition-all duration-500 hover:ring-white/40 hover:shadow-2xl hover:shadow-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${galleryLayout[index] ?? "lg:col-span-2"}`}
              >
                <Image
                  src={imageSrc}
                  alt={`Social Justice Symposium highlight ${index + 1}`}
                  fill
                  sizes={
                    isFeature
                      ? "(min-width: 1024px) 66vw, 100vw"
                      : "(min-width: 1024px) 33vw, 50vw"
                  }
                  className="object-cover grayscale-[40%] transition duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0 group-focus-visible:grayscale-0"
                />

                {/* Legibility gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Caption on the lead photo */}
                {index === 0 && (
                  <span className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-left">
                    <span className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                      Caldwell University
                    </span>
                    <span className="mt-1 block font-serif text-lg sm:text-2xl lg:text-3xl font-bold text-white">
                      Social Justice Symposium
                    </span>
                  </span>
                )}

                {/* Expand affordance */}
                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/40 backdrop-blur-md transition-all duration-300 sm:translate-y-2 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:bg-white group-hover:text-black group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Counter, Thumbnails]}
        thumbnails={{
          width: 96,
          height: 64,
          border: 0,
          borderRadius: 8,
          padding: 0,
          gap: 12,
          vignette: true,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
          thumbnailsContainer: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
          thumbnail: { backgroundColor: "transparent" },
        }}
      />

      {/* Campus Map Section */}
      <div className="relative z-10 max-w-6xl mx-auto mt-20 px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 font-serif">
            Find Us
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-white mx-auto"></div>
          <p className="text-white/80 mt-4 text-sm sm:text-base">
            Caldwell University Campus
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campus Map Image */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              Campus Map
            </h3>
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/Campus-Map.jpg"
                alt="Caldwell University Campus Map"
                fill
                className="object-contain bg-white"
              />
            </div>
          </div>

          {/* Google Maps */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Location</h3>
            <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3018.719499814611!2d-74.27463902424437!3d40.83412447137548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c3aa7ed1bd9d0d%3A0xf9310128da194d24!2sCaldwell%20University!5e0!3m2!1sen!2set!4v1736188574759!5m2!1sen!2set"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.google.com/maps/place/Caldwell+University/@40.8341245,-74.2746398,17z/data=!3m1!4b1!4m6!3m5!1s0x89c3aa7ed1bd9d0d:0xf9310128da194d24!8m2!3d40.8341245!4d-74.2720649!16zL20vMDN3eWhy?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Open in Google Maps
              </a>
              <a
                href="https://maps.apple.com/?address=120%20Bloomfield%20Ave,%20Caldwell,%20NJ%2007006,%20United%20States&auid=5304745748864836216&ll=40.834125,-74.272065&lsp=9902&q=Caldwell%20University"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-white/40"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Open in Apple Maps
              </a>
            </div>

            {/* Address */}
            <div className="mt-4 text-white/80 text-sm">
              <p className="font-medium text-white mb-1">Address:</p>
              <p>120 Bloomfield Ave</p>
              <p>Caldwell, NJ 07006</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
