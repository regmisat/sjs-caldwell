"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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

type ViewMode = "registered" | "browse";

export default function RegisteredSessions({
  firstName: _firstName = "",
  lastName: _lastName = "",
}: RegisteredSessionsProps) {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("registered");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, registrationsRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/sessions/register"),
      ]);

      const sessionsData = await sessionsRes.json();
      const registrationsData = await registrationsRes.json();

      setAllSessions(sessionsData.sessions || []);
      setRegisteredIds(new Set(registrationsData.sessionIds || []));
    } catch (error) {
      console.error("Error fetching registered sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const registeredSessions = useMemo(
    () => allSessions.filter((session) => registeredIds.has(session.id)),
    [allSessions, registeredIds],
  );

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

  const groupedSessions = useMemo(() => {
    return allSessions.reduce(
      (acc, session) => {
        const timeKey = formatTimeRange(session.start_time, session.end_time);
        if (!acc[timeKey]) acc[timeKey] = [];
        acc[timeKey].push(session);
        return acc;
      },
      {} as Record<string, Session[]>,
    );
  }, [allSessions]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const handleRegister = async (sessionId: string) => {
    setProcessingId(sessionId);
    try {
      const res = await fetch("/api/sessions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setRegisteredIds((prev) => new Set([...prev, sessionId]));
        showMessage("success", "Registered for session successfully.");
        await fetchData();
      } else {
        const data = await res.json();
        showMessage("error", data.error || "Failed to register");
      }
    } catch (error) {
      console.error("Error registering:", error);
      showMessage("error", "Failed to register");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnregister = async (sessionId: string) => {
    if (!confirm("Are you sure you want to unregister from this session?")) {
      return;
    }

    setProcessingId(sessionId);
    try {
      const res = await fetch("/api/sessions/register", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setRegisteredIds((prev) => {
          const next = new Set(prev);
          next.delete(sessionId);
          return next;
        });
        showMessage("success", "Unregistered from session.");
        await fetchData();
      } else {
        showMessage("error", "Failed to unregister");
      }
    } catch (error) {
      console.error("Error unregistering:", error);
      showMessage("error", "Failed to unregister");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Session views"
          className="inline-flex w-full sm:w-auto rounded-lg border border-gray-200 bg-gray-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "registered"}
            onClick={() => setView("registered")}
            className={`flex-1 sm:flex-none rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              view === "registered"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Sessions ({registeredSessions.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "browse"}
            onClick={() => setView("browse")}
            className={`flex-1 sm:flex-none rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              view === "browse"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Browse & Register
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {view === "registered" ? (
        registeredSessions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
              <svg
                className="h-7 w-7 text-gray-400"
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
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No Sessions Registered
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Browse available sessions and register without leaving your
              dashboard.
            </p>
            <Button
              onClick={() => setView("browse")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Browse Sessions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {registeredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isRegistered
                isProcessing={processingId === session.id}
                onRegister={() => handleRegister(session.id)}
                onUnregister={() => handleUnregister(session.id)}
                formatTimeRange={formatTimeRange}
              />
            ))}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setView("browse")}
                className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Register for more sessions
              </button>
            </div>
          </div>
        )
      ) : Object.keys(groupedSessions).length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
          No sessions are available yet.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([timeSlot, sessions]) => (
            <div key={timeSlot} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {timeSlot}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isRegistered={registeredIds.has(session.id)}
                    isProcessing={processingId === session.id}
                    onRegister={() => handleRegister(session.id)}
                    onUnregister={() => handleUnregister(session.id)}
                    formatTimeRange={formatTimeRange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  isRegistered,
  isProcessing,
  onRegister,
  onUnregister,
  formatTimeRange,
}: {
  session: Session;
  isRegistered: boolean;
  isProcessing: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  formatTimeRange: (start: string, end: string) => string;
}) {
  const isFull = session.registration_count >= session.max_attendees;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {session.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>
                {formatTimeRange(session.start_time, session.end_time)}
              </span>
              {session.location && <span>{session.location}</span>}
            </div>
          </div>

          {session.description && (
            <div
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: session.description.replaceAll("&nbsp;", " "),
              }}
            />
          )}

          {session.speakers.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-900">
                Speakers
              </p>
              <div className="flex flex-wrap gap-3">
                {session.speakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-center gap-2">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-300">
                      {speaker.photo_url ? (
                        <Image
                          src={speaker.photo_url}
                          alt={speaker.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs font-bold text-gray-600">
                          {speaker.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-700">
                      {speaker.name}
                      {speaker.title && (
                        <span className="text-gray-500"> — {speaker.title}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 text-sm text-gray-600">
            <span>
              <span className="font-semibold text-gray-900">
                {session.registration_count}
              </span>{" "}
              / {session.max_attendees} attendees
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isFull
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isFull ? "Full" : "Available"}
            </span>
            {isRegistered && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                Registered
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 sm:pt-0.5">
          {isRegistered ? (
            <Button
              onClick={onUnregister}
              disabled={isProcessing}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isProcessing ? "Processing..." : "Unregister"}
            </Button>
          ) : (
            <Button
              onClick={onRegister}
              disabled={isFull || isProcessing}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold"
            >
              {isProcessing ? "Processing..." : isFull ? "Full" : "Register"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
