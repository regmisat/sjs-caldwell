"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateCertificate } from "@/lib/generateCertificate";

interface Session {
  id: string;
  title: string;
  start_time?: string;
}

interface CertificateDownloadProps {
  firstName: string;
  lastName: string;
}

const MAX_SELECTABLE_SESSIONS = 6;
const PROGRAM_END_DATE = new Date("2026-02-27T15:15:00-05:00");

export default function CertificateDownload({
  firstName,
  lastName,
}: CertificateDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasProgramEnded, setHasProgramEnded] = useState(
    Date.now() >= PROGRAM_END_DATE.getTime(),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHasProgramEnded(Date.now() >= PROGRAM_END_DATE.getTime());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSessionData = async () => {
      setIsLoadingSessions(true);
      try {
        const [sessionsRes, registrationsRes] = await Promise.all([
          fetch("/api/sessions"),
          fetch("/api/sessions/register"),
        ]);

        const sessionsData = await sessionsRes.json();
        const registrationsData = await registrationsRes.json();

        const sessions: Session[] = Array.isArray(sessionsData?.sessions)
          ? sessionsData.sessions
          : [];
        const registeredIds: string[] = Array.isArray(
          registrationsData?.sessionIds,
        )
          ? registrationsData.sessionIds
          : [];

        setAllSessions(sessions);
        setSelectedSessionIds(registeredIds.slice(0, MAX_SELECTABLE_SESSIONS));
      } catch (error) {
        console.error("Error loading sessions for certificates:", error);
        setAllSessions([]);
        setSelectedSessionIds([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    void fetchSessionData();
  }, []);

  const selectedSessions = useMemo(
    () =>
      allSessions.filter((session) => selectedSessionIds.includes(session.id)),
    [allSessions, selectedSessionIds],
  );

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessionIds((current) => {
      if (current.includes(sessionId)) {
        return current.filter((id) => id !== sessionId);
      }

      if (current.length >= MAX_SELECTABLE_SESSIONS) {
        return current;
      }

      return [...current, sessionId];
    });
  };

  const handleDownload = async () => {
    if (!firstName || !lastName) {
      alert(
        "Please complete your profile with your name to download the certificate.",
      );
      return;
    }

    if (!hasProgramEnded) {
      alert("Certificates can be downloaded only after the program ends.");
      return;
    }

    if (selectedSessions.length === 0) {
      alert("Please select at least one event for your certificate.");
      return;
    }

    setIsGenerating(true);
    try {
      await generateCertificate({
        firstName,
        lastName,
        sessions: selectedSessions.map((session) => ({
          id: session.id,
          title: session.title,
        })),
        eventName: "Social Justice Institute",
        eventDate: "February 27, 2026",
        organizationName: "Caldwell University",
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-lg p-6">
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
            Get your personalized certificate of participation for the Social
            Justice Institute after the program ends.
            {selectedSessions.length > 0 && (
              <span className="block mt-1 text-gray-500">
                {selectedSessions.length} selected event
                {selectedSessions.length !== 1 ? "s" : ""} will be included.
              </span>
            )}
            {!hasProgramEnded && (
              <span className="block mt-1 text-amber-700 font-medium">
                Available after February 27, 2026 at 3:15 PM ET.
              </span>
            )}
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isLoadingSessions}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Select Events ({selectedSessionIds.length}/
                {MAX_SELECTABLE_SESSIONS})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Select Events for Certificate</DialogTitle>
                <DialogDescription>
                  Choose up to {MAX_SELECTABLE_SESSIONS} events. Registered
                  events are preselected, and you can add events you attended
                  without registering.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                {allSessions.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No events available right now.
                  </p>
                ) : (
                  allSessions.map((session) => {
                    const isChecked = selectedSessionIds.includes(session.id);
                    const disableNewSelection =
                      !isChecked &&
                      selectedSessionIds.length >= MAX_SELECTABLE_SESSIONS;

                    return (
                      <label
                        key={session.id}
                        className={`flex items-start gap-3 p-2 rounded-md border ${
                          isChecked
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200"
                        } ${disableNewSelection ? "opacity-60" : ""}`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-red-600"
                          checked={isChecked}
                          disabled={disableNewSelection}
                          onChange={() => toggleSessionSelection(session.id)}
                        />
                        <span className="text-sm text-gray-800">
                          {session.title}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleDownload}
            disabled={
              isGenerating ||
              isLoadingSessions ||
              !hasProgramEnded ||
              selectedSessions.length === 0
            }
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all"
          >
            {isGenerating ? (
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
  );
}
