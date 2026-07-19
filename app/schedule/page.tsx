"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Header from "../../components/Header";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

interface Session {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  max_attendees: number;
  is_general: boolean;
  registration_count: number;
  speakers: Array<{
    id: string;
    name: string;
    title: string | null;
    photo_url: string | null;
  }>;
}

export default function Schedule() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [registeredSessions, setRegisteredSessions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [isSignedIn]);

  const fetchData = async () => {
    try {
      // Fetch sessions
      const sessionsRes = await fetch("/api/sessions");
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.sessions || []);

      // Fetch user's registrations if signed in
      if (isSignedIn) {
        const registrationsRes = await fetch("/api/sessions/register");
        const registrationsData = await registrationsRes.json();
        setRegisteredSessions(new Set(registrationsData.sessionIds || []));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (sessionId: string) => {
    if (!isSignedIn) {
      alert("Please sign in to register for sessions");
      return;
    }

    setRegistering(sessionId);
    try {
      const res = await fetch("/api/sessions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setRegisteredSessions((prev) => new Set([...prev, sessionId]));
        // Refresh sessions to get updated counts
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to register");
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Failed to register");
    } finally {
      setRegistering(null);
    }
  };

  const handleUnregister = async (sessionId: string) => {
    setRegistering(sessionId);
    try {
      const res = await fetch("/api/sessions/register", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setRegisteredSessions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
        // Refresh sessions to get updated counts
        await fetchData();
      } else {
        alert("Failed to unregister");
      }
    } catch (error) {
      console.error("Error unregistering:", error);
      alert("Failed to unregister");
    } finally {
      setRegistering(null);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Group sessions by time slot
  const groupedSessions = sessions.reduce((acc, session) => {
    const timeKey = formatTimeRange(session.start_time, session.end_time);
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  if (loading) {
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

          {/* Loading Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen py-24 sm:py-28 px-4">
            <div className="max-w-6xl mx-auto w-full">
              {/* Logo Skeleton */}
              <div className="mx-auto mb-8 sm:mb-12 text-center">
                <Skeleton className="h-[150px] w-[150px] sm:h-[200px] sm:w-[200px] rounded-lg mx-auto bg-white/20" />
              </div>

              {/* Heading Skeleton */}
              <div className="mb-12 sm:mb-16 text-center">
                <Skeleton className="h-12 sm:h-16 w-64 sm:w-96 mx-auto mb-4 bg-white/20" />
                <Skeleton className="h-1 w-20 sm:w-32 mx-auto mb-4 bg-white/30" />
                <Skeleton className="h-6 w-48 mx-auto bg-white/20" />
              </div>

              {/* Schedule Skeleton */}
              <div className="space-y-8">
                {[1, 2].map((timeSlot) => (
                  <div key={timeSlot} className="space-y-4">
                    <Skeleton className="h-8 w-48 mb-4 bg-white/20" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {[1, 2].map((session) => (
                        <div
                          key={session}
                          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                        >
                          <Skeleton className="h-6 w-3/4 mb-4 bg-white/20" />
                          <Skeleton className="h-4 w-32 mb-4 bg-white/20" />
                          <Skeleton className="h-16 w-full mb-4 bg-white/20" />
                          <div className="space-y-2 mb-4">
                            <Skeleton className="h-4 w-24 mb-2 bg-white/20" />
                            <Skeleton className="h-8 w-48 bg-white/20" />
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-white/20">
                            <Skeleton className="h-4 w-32 bg-white/20" />
                            <Skeleton className="h-10 w-24 bg-white/20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
          <div className="max-w-6xl mx-auto">
           

            {/* Heading */}
            <div className="mb-12 sm:mb-16 text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-4 font-serif">
                Event Schedule
              </h1>
              <div className="w-20 sm:w-32 h-1 bg-white mx-auto mb-4"></div>
              <p className="text-lg sm:text-xl text-white">
                Friday, February 27, 2026
              </p>
            </div>

            {/* Schedule */}
            <div className="space-y-8">
              {Object.entries(groupedSessions).length ? (
                Object.entries(groupedSessions).map(([timeSlot, sessions]) => (
                  <div key={timeSlot} className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                      {timeSlot}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {sessions.map((session) => {
                        const isRegistered = registeredSessions.has(session.id);
                        const isFull =
                          session.registration_count >= session.max_attendees;
                        const isProcessing = registering === session.id;

                        return (
                          <div
                            key={session.id}
                            className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl ${
                              session.is_general ? "lg:col-span-2" : ""
                            }`}
                          >
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                  {session.title}
                                </h3>
                                {session.location && (
                                  <div className="flex items-center gap-1 text-sm text-white mb-2">
                                    <svg
                                      className="w-4 h-4 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    {session.location}
                                  </div>
                                )}
                              </div>

                              {session.description && (
                                <div
                                  className="prose prose-invert prose-sm prose-p:text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white max-w-none"
                                  dangerouslySetInnerHTML={{
                                    __html: session.description.replaceAll(
                                      "&nbsp;",
                                      " "
                                    ),
                                  }}
                                />
                              )}

                              {session.speakers.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-white mb-2">
                                    Speakers:
                                  </p>
                                  <div className="space-y-2">
                                    {session.speakers.map((speaker) => (
                                      <div
                                        key={speaker.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                                          {speaker.photo_url ? (
                                            <Image
                                              src={speaker.photo_url}
                                              alt={speaker.name}
                                              width={32}
                                              height={32}
                                              className="object-cover w-full h-full"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                              <span className="text-xs font-bold text-white">
                                                {speaker.name
                                                  .charAt(0)
                                                  .toUpperCase()}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-sm text-white">
                                          {speaker.name}
                                          {speaker.title &&
                                            ` - ${speaker.title}`}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                <div className="text-sm text-white">
                                  <span
                                    className={`font-semibold ${
                                      isFull ? "text-red-300" : "text-green-300"
                                    }`}
                                  >
                                    {session.registration_count} /{" "}
                                    {session.max_attendees}
                                  </span>{" "}
                                  Attendees
                                </div>

                                {/* {!session.is_general && ( */}
                                <div>
                                  <SignedOut>
                                    <SignUpButton
                                      mode="modal"
                                      forceRedirectUrl="/onboarding"
                                    >
                                      <button className="bg-white text-black hover:bg-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm">
                                        Sign In to Register
                                      </button>
                                    </SignUpButton>
                                  </SignedOut>
                                  <SignedIn>
                                    {isRegistered ? (
                                      <button
                                        onClick={() =>
                                          handleUnregister(session.id)
                                        }
                                        disabled={isProcessing}
                                        className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-600 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
                                      >
                                        {isProcessing ? (
                                          <>
                                            <svg
                                              className="animate-spin h-4 w-4"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                            >
                                              <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                              ></circle>
                                              <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                              ></path>
                                            </svg>
                                            <span>Processing...</span>
                                          </>
                                        ) : (
                                          "Unregister"
                                        )}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleRegister(session.id)
                                        }
                                        disabled={isFull || isProcessing}
                                        className="bg-white text-black hover:bg-white disabled:bg-gray-600 disabled:text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
                                      >
                                        {isProcessing ? (
                                          <>
                                            <svg
                                              className="animate-spin h-4 w-4"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                            >
                                              <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                              ></circle>
                                              <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                              ></path>
                                            </svg>
                                            <span>Processing...</span>
                                          </>
                                        ) : isFull ? (
                                          "Full"
                                        ) : (
                                          "Register"
                                        )}
                                      </button>
                                    )}
                                  </SignedIn>
                                </div>
                                {/* )} */}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/20 shadow-2xl mx-auto text-center">
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
                      We're working hard to finalize the event schedule. Check
                      back soon for detailed information about sessions,
                      speakers, and activities.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="mt-12 text-center">
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                  <button className="bg-white text-black hover:bg-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl">
                    Sign Up to Register
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-white text-black hover:bg-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 text-base sm:text-lg shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </button>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
