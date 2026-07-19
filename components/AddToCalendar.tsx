"use client";

import { FaGoogle, FaApple, FaMicrosoft } from "react-icons/fa";
import { eventInfo } from "../app/data/eventInfo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export default function AddToCalendar() {
  const eventDate = eventInfo.eventDate.replace(/-/g, "");
  const eventStartTime = eventInfo.eventStartTime.replace(/:/g, "");
  const eventEndTime = eventInfo.eventEndTime.replace(/:/g, "");
  const eventTitle = eventInfo.title;
  const eventDescription =
    eventInfo.pageMessage ||
    `Join us for the Social Justice Institute on ${eventInfo.eventDate}`;
  const eventLocation = eventInfo.location;

  // Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventTitle
  )}&dates=${eventDate}T${eventStartTime}00/${eventDate}T${eventEndTime}00&details=${encodeURIComponent(
    eventDescription
  )}&location=${encodeURIComponent(eventLocation)}&ctz=America/New_York`;

  // Outlook Calendar URL
  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
    eventTitle
  )}&startdt=${eventDate}T${eventStartTime}00&enddt=${eventDate}T${eventEndTime}00&body=${encodeURIComponent(
    eventDescription
  )}&location=${encodeURIComponent(eventLocation)}`;

  // Generate .ics file content for Apple Calendar
  const generateICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Social Justice Institute//Social Justice Institute//EN
BEGIN:VEVENT
UID:${eventDate}-${eventStartTime}-social-justice-Institute@caldwell.edu
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${eventDate}T${eventStartTime}00
DTEND:${eventDate}T${eventEndTime}00
SUMMARY:${eventTitle}
DESCRIPTION:${eventDescription.replace(/\n/g, "\\n")}
LOCATION:${eventLocation}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Social-Justice-Institute.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row justify- gap-4 px-0">
      {/* Google Calendar Button */}
      <Button
        asChild
        className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-medium text-base sm:text-lg px-6 sm:px-8 py-4 h-auto"
      >
        <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
          <FaGoogle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden xs:inline">Add to Google Calendar</span>
          <span className="xs:hidden">Google Calendar</span>
        </a>
      </Button>

      {/* More Options Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-medium text-base sm:text-lg px-4 sm:px-6 py-4 h-auto"
          >
            <span className="hidden xs:inline">More</span>
            <span className="xs:hidden">More</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 sm:w-72 bg-white/10 backdrop-blur-sm border border-white/20 text-white"
          align="end"
        >
          {/* Outlook Calendar Option */}
          <DropdownMenuItem asChild>
            <a
              href={outlookCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer"
            >
              <FaMicrosoft className="w-4 h-4" />
              Add to Outlook
            </a>
          </DropdownMenuItem>

          {/* Apple Calendar Option */}
          <DropdownMenuItem asChild>
            <button
              onClick={generateICS}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer w-full text-left"
            >
              <FaApple className="w-4 h-4" />
              Add to Apple Calendar
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
