import { createServiceClient } from "@/utils/supabase/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ADMIN_EMAILS } from "@/utils/CONSTANTS";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Use service role client to bypass RLS and get all sessions
    const supabase = createServiceClient();

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

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      start_time,
      end_time,
      location,
      max_attendees,
      is_general,
      speaker_ids,
      is_published,
    } = body;

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Title, start_time, and end_time are required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        title,
        description: description || null,
        start_time,
        end_time,
        location: location || null,
        max_attendees: max_attendees || 0,
        is_general: is_general || false,
        is_published: is_published || false,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Add speaker associations if provided
    if (speaker_ids && speaker_ids.length > 0) {
      const speakerAssociations = speaker_ids.map((speaker_id: string) => ({
        session_id: session.id,
        speaker_id,
      }));

      const { error: speakersError } = await supabase
        .from("session_speakers")
        .insert(speakerAssociations);

      if (speakersError) throw speakersError;
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      start_time,
      end_time,
      location,
      max_attendees,
      is_general,
      speaker_ids,
      is_published,
    } = body;

    if (!id || !title || !start_time || !end_time) {
      return NextResponse.json(
        { error: "ID, title, start_time, and end_time are required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .update({
        title,
        description: description || null,
        start_time,
        end_time,
        location: location || null,
        max_attendees: max_attendees || 0,
        is_general: is_general || false,
        updated_at: new Date().toISOString(),
        is_published: is_published || false,
      })
      .eq("id", id)
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Update speaker associations
    // First, remove all existing associations
    const { error: deleteError } = await supabase
      .from("session_speakers")
      .delete()
      .eq("session_id", id);

    if (deleteError) throw deleteError;

    // Then add new associations if provided
    if (speaker_ids && speaker_ids.length > 0) {
      const speakerAssociations = speaker_ids.map((speaker_id: string) => ({
        session_id: id,
        speaker_id,
      }));

      const { error: speakersError } = await supabase
        .from("session_speakers")
        .insert(speakerAssociations);

      if (speakersError) throw speakersError;
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    const { error } = await supabase.from("sessions").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
