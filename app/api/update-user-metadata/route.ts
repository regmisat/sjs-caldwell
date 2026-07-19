import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/server";

interface FieldChange {
  field: string;
  old_value: string | null;
  new_value: string | null;
}

const normalize = (value: unknown): string | null =>
  value === undefined || value === null || value === ""
    ? null
    : typeof value === "string"
      ? value
      : JSON.stringify(value);

function diffFields(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): FieldChange[] {
  const changes: FieldChange[] = [];
  for (const field of Object.keys(newValues)) {
    const oldValue = normalize(oldValues[field]);
    const newValue = normalize(newValues[field]);
    if (oldValue !== newValue) {
      changes.push({ field, old_value: oldValue, new_value: newValue });
    }
  }
  return changes;
}

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
    let changes: FieldChange[] = [];

    // If direct unsafeMetadata is provided (from success page), merge it
    if (unsafeMetadata) {
      updatedMetadata = {
        ...existingMetadata,
        ...unsafeMetadata,
      };
      changes = diffFields(existingMetadata || {}, unsafeMetadata);
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
      changes = diffFields(
        {
          firstName: user.firstName,
          lastName: user.lastName,
          ...existingMetadata,
        },
        {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          pronouns,
          classification,
          title,
          organization,
          phoneNumber,
          howDidYouHear,
          additionalInfo,
        }
      );
    }

    // Update user with Clerk's backend API
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      firstName: firstName || user.firstName || undefined,
      lastName: lastName || user.lastName || undefined,
      unsafeMetadata: updatedMetadata,
    });

    // Record the edit in Supabase; failures here should not block the update
    if (changes.length > 0) {
      try {
        const supabase = createServiceClient();
        const { error: historyError } = await supabase
          .from("user_edit_history")
          .insert({
            user_id: userId,
            edited_by: userId,
            source: unsafeMetadata ? "metadata_update" : "edit_information",
            changes,
          });
        if (historyError) {
          console.error("Failed to record edit history:", historyError);
        }
      } catch (historyError) {
        console.error("Failed to record edit history:", historyError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return NextResponse.json(
      { error: "Failed to update user metadata" },
      { status: 500 }
    );
  }
}
