import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Get the current user to preserve existing metadata
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingMetadata = user.unsafeMetadata as any;

    // Handle different types of metadata updates
    const {
      firstName,
      lastName,
      pronouns,
      classification,
      title,
      organization,
      phoneNumber,
      howDidYouHear,
      additionalInfo,
      unsafeMetadata,
    } = body;

    // Prepare updated metadata
    let updatedMetadata = { ...existingMetadata };

    // If direct unsafeMetadata is provided (from success page), merge it
    if (unsafeMetadata) {
      updatedMetadata = {
        ...existingMetadata,
        ...unsafeMetadata,
      };
    } else {
      // Otherwise, update from form fields
      updatedMetadata = {
        ...existingMetadata,
        pronouns,
        classification,
        title,
        organization,
        phoneNumber,
        howDidYouHear,
        additionalInfo,
      };
    }

    // Update user with Clerk's backend API
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      firstName: firstName || user.firstName || undefined,
      lastName: lastName || user.lastName || undefined,
      unsafeMetadata: updatedMetadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return NextResponse.json(
      { error: "Failed to update user metadata" },
      { status: 500 }
    );
  }
}
