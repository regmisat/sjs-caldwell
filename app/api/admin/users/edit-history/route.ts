import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ADMIN_EMAILS } from "@/utils/CONSTANTS";
import { createServiceClient } from "@/utils/supabase/server";

// GET - Fetch edit history for a user (admin only)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access only" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("user_edit_history")
      .select("id, user_id, edited_by, source, changes, created_at")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ history: data || [] });
  } catch (error: any) {
    console.error("Error fetching edit history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch edit history" },
      { status: 500 }
    );
  }
}
