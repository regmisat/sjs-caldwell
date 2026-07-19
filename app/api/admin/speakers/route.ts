import { createClient, createServiceClient } from "@/utils/supabase/server";
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

    // Use service role client to bypass RLS and get all speakers
    const supabase = createServiceClient();

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
            location
          )
        )
      `
      )
      .order("is_keynote", { ascending: false })
      .order("name");

    if (error) throw error;

    // Transform the data to include session list
    const transformedSpeakers = speakers?.map((speaker: any) => ({
      ...speaker,
      sessions: speaker.session_speakers?.map((ss: any) => ss.session) || [],
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
    const { name, title, bio, photo_url, is_keynote, is_published } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("speakers")
      .insert({
        name,
        title: title || null,
        bio: bio || null,
        photo_url: photo_url || null,
        is_keynote: is_keynote || false,
        is_published: is_published || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ speaker: data });
  } catch (error) {
    console.error("Error creating speaker:", error);
    return NextResponse.json(
      { error: "Failed to create speaker" },
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
    const { id, name, title, bio, photo_url, is_keynote, is_published } = body;

    console.log({
      is_published,
    });

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("speakers")
      .update({
        name,
        title: title || null,
        bio: bio || null,
        photo_url: photo_url || null,
        is_keynote: is_keynote || false,
        updated_at: new Date().toISOString(),
        is_published: is_published || false,
      })
      .eq("id", id)
      .select()
      .single();

    console.log({
      data,
    });

    if (error) {
      console.error("Error updating speaker:", error);
      throw error;
    }

    return NextResponse.json({ speaker: data });
  } catch (error) {
    console.error("Error updating speaker:", error);
    return NextResponse.json(
      { error: "Failed to update speaker" },
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
        { error: "Speaker ID is required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    const { error } = await supabase.from("speakers").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting speaker:", error);
    return NextResponse.json(
      { error: "Failed to delete speaker" },
      { status: 500 }
    );
  }
}
