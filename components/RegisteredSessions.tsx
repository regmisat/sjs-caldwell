"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateCertificate } from "@/lib/generateCertificate";

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

interface RegisteredSessionsProps {
  firstName?: string;
  lastName?: string;
}

export default function RegisteredSessions({
  firstName = "",
  lastName = "",
}: RegisteredSessionsProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [unregistering, setUnregistering] = useState<string | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  useEffect(() => {
    fetchRegisteredSessions();
  }, []);

  const fetchRegisteredSessions = async () => {
    try {
      // Fetch all sessions
      const sessionsRes = await fetch("/api/sessions");
      const sessionsData = await sessionsRes.json();

      // Fetch user's registrations
      const registrationsRes = await fetch("/api/sessions/register");
      const registrationsData = await registrationsRes.json();

      // Filter sessions to only show registered ones
      const registeredSessionIds = new Set(registrationsData.sessionIds || []);
      const registeredSessions = (sessionsData.sessions || []).filter(
        (session: Session) => registeredSessionIds.has(session.id),
      );

      setSessions(registeredSessions);
    } catch (error) {
      console.error("Error fetching registered sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (sessionId: string) => {
    if (!confirm("Are you sure you want to unregister from this session?")) {
      return;
    }

    setUnregistering(sessionId);
    try {
      const res = await fetch("/api/sessions/register", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        // Remove the session from the list
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        alert("Failed to unregister");
      }
    } catch (error) {
      console.error("Error unregistering:", error);
      alert("Failed to unregister");
    } finally {
      setUnregistering(null);
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

  const handleDownloadCertificate = async () => {
    if (!firstName || !lastName) {
      alert(
        "Please complete your profile with your name to download the certificate.",
      );
      return;
    }

    setIsGeneratingCert(true);
    try {
      await generateCertificate({
        firstName,
        lastName,
        sessions: sessions.map((s) => ({ id: s.id, title: s.title })),
        eventName: "Social Justice Institute",
        eventDate: "February 27, 2026",
        organizationName: "Caldwell University",
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGeneratingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Sessions Registered
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't registered for any sessions yet.
          </p>
          <button
            onClick={() => router.push("/schedule")}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Browse Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="space-y-4">
        {sessions.map((session) => {
          const isProcessing = unregistering === session.id;

          return (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Session Title & Time */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {session.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {formatTimeRange(
                            session.start_time,
                            session.end_time,
                          )}
                        </span>
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-1">
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
                          <span>{session.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnregister(session.id)}
                    disabled={isProcessing}
                    className="flex-shrink-0 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
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
                </div>

                {/* Description */}
                {session.description && (
                  <div
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: session.description.replaceAll("&nbsp;", " "),
                    }}
                  />
                )}

                {/* Speakers */}
                {session.speakers.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Speakers:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {session.speakers.map((speaker) => (
                        <div
                          key={speaker.id}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                            {speaker.photo_url ? (
                              <Image
                                src={speaker.photo_url}
                                alt={speaker.name}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600">
                                  {speaker.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-700">
                            {speaker.name}
                            {speaker.title && (
                              <span className="text-gray-500">
                                {" "}
                                - {speaker.title}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendance Count */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {session.registration_count}
                      </span>{" "}
                      / {session.max_attendees} attendees
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        session.registration_count >= session.max_attendees
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {session.registration_count >= session.max_attendees
                        ? "Full"
                        : "Available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Action */}
      <div className="mt-6 pt-6 border-t border-gray-300 text-center">
        <button
          onClick={() => router.push("/schedule")}
          className="inline-flex items-center text-red-600 hover:text-red-700 font-semibold transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Register for More Sessions
        </button>
      </div>

      {/* Certificate Download Section */}
      {/* {sessions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-300">
          <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Download Your Certificate
                </h3>
                <p className="text-sm text-gray-600">
                  Get your personalized certificate of participation.
                  <span className="block mt-1 text-gray-500">
                    Your {sessions.length} session
                    {sessions.length !== 1 ? "s" : ""} will be included.
                  </span>
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={handleDownloadCertificate}
                  disabled={isGeneratingCert}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all"
                >
                  {isGeneratingCert ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download PDF
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
