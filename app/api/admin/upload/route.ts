import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/server";
import {
  SPEAKER_PHOTOS_BUCKET,
  ensureSpeakerPhotosBucket,
} from "@/utils/supabase/storage";
import { ADMIN_EMAILS } from "@/utils/CONSTANTS";

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
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Validate file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 15MB" },
        { status: 400 },
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient();

    // Create bucket if it doesn't exist yet
    try {
      await ensureSpeakerPhotosBucket(supabase);
    } catch (bucketError) {
      console.error("Failed to ensure storage bucket:", bucketError);
      return NextResponse.json(
        {
          error:
            bucketError instanceof Error
              ? bucketError.message
              : "Failed to create storage bucket",
        },
        { status: 500 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${timestamp}-${Math.random()
      .toString(36)
      .substring(7)}.${ext}`;
    const filepath = `speakers/${filename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from(SPEAKER_PHOTOS_BUCKET)
      .upload(filepath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to upload to storage" },
        { status: 500 },
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(SPEAKER_PHOTOS_BUCKET)
      .getPublicUrl(filepath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 },
    );
  }
}
