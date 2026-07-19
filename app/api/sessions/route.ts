import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch sessions with speaker count and registration count
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        session_speakers (
          speaker:speakers (
            id,
            name,
            title,
            photo_url
          )
        ),
        registrations:session_registrations (count)
      `
      )
      .eq("is_published", true)
      .order("start_time");

    if (error) throw error;

    // Transform the data to include speaker list and registration count
    const transformedSessions = sessions?.map((session: any) => ({
      ...session,
      speakers: session.session_speakers?.map((ss: any) => ss.speaker) || [],
      registration_count: session.registrations?.[0]?.count || 0,
    }));

    return NextResponse.json({ sessions: transformedSessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
