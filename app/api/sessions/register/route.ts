import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();
    const supabase = await createClient();

    // Check if session exists and has capacity
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*, registrations:session_registrations(count)")
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;

    const registrationCount = session.registrations?.[0]?.count || 0;
    if (registrationCount >= session.max_attendees) {
      return NextResponse.json({ error: "Session is full" }, { status: 400 });
    }

    // Register user for session
    const { error: insertError } = await supabase
      .from("session_registrations")
      .insert({ session_id: sessionId, user_id: userId });

    if (insertError) {
      if (insertError.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "Already registered" },
          { status: 400 }
        );
      }
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registering for session:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();
    const supabase = await createClient();

    const { error } = await supabase
      .from("session_registrations")
      .delete()
      .eq("session_id", sessionId)
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unregistering from session:", error);
    return NextResponse.json(
      { error: "Failed to unregister" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: registrations, error } = await supabase
      .from("session_registrations")
      .select("session_id")
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({
      sessionIds: registrations?.map((r) => r.session_id) || [],
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
