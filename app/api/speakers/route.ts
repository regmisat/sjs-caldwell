import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: speakers, error } = await supabase
      .from("speakers")
      .select(
        `
        *,
        session_speakers (
          session:sessions (
            id,
            title,
            start_time,
            end_time,
            location,
            is_published
          )
        )
      `
      )
      .eq("is_published", true)
      .order("is_keynote", { ascending: false })
      .order("name");

    if (error) throw error;

    // Transform the data to include session list (only published sessions)
    const transformedSpeakers = speakers?.map((speaker: any) => ({
      ...speaker,
      sessions:
        speaker.session_speakers
          ?.map((ss: any) => ss.session)
          .filter((session: any) => session?.is_published) || [],
    }));

    return NextResponse.json({ speakers: transformedSpeakers });
  } catch (error) {
    console.error("Error fetching speakers:", error);
    return NextResponse.json(
      { error: "Failed to fetch speakers" },
      { status: 500 }
    );
  }
}
