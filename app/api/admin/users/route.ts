import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { ADMIN_EMAILS } from "@/utils/CONSTANTS";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin email
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access only" },
        { status: 403 }
      );
    }

    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({ limit: 500 });

    // Format user data
    const users = usersResponse.data.map((clerkUser) => {
      const metadata = clerkUser.unsafeMetadata as any;

      // Determine payment type based on paymentSessionId and paymentType
      let paymentType = "unknown";
      if (metadata?.paymentType === "paid") {
        paymentType = "paid";
      } else if (metadata?.paymentSessionId === "exempt") {
        paymentType = "exempt";
      }

      return {
        id: clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        createdAt: clerkUser.createdAt,
        lastSignInAt: clerkUser.lastSignInAt,
        imageUrl: clerkUser.imageUrl,
        metadata: {
          title: metadata?.title || null,
          pronouns: metadata?.pronouns || null,
          phoneNumber: metadata?.phoneNumber || null,
          organization: metadata?.organization || null,
          howDidYouHear: metadata?.howDidYouHear || null,
          additionalInfo: metadata?.additionalInfo || null,
          isCheckedIn: metadata?.isCheckedIn || false,
          paymentSessionId: metadata?.paymentSessionId || null,
          classification: metadata?.classification || null,
          hasCompletedOnboarding: metadata?.hasCompletedOnboarding || false,
          qrCode: metadata?.qrCode || null,
          paymentType: paymentType as "paid" | "exempt" | "unknown",
          paymentAmount: metadata?.paymentAmount || 39,
        },
      };
    });

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin email
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId: targetUserId, firstName, lastName, metadata } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    // Update user details
    const updateData: any = {};

    if (firstName !== undefined) {
      updateData.firstName = firstName;
    }

    if (lastName !== undefined) {
      updateData.lastName = lastName;
    }

    // Update metadata if provided
    if (metadata) {
      const targetUser = await client.users.getUser(targetUserId);
      const currentMetadata = (targetUser.unsafeMetadata as any) || {};

      updateData.unsafeMetadata = {
        ...currentMetadata,
        ...metadata,
      };
    }

    const updatedUser = await client.users.updateUser(targetUserId, updateData);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        metadata: updatedUser.unsafeMetadata,
      },
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin email
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

    // Prevent self-deletion
    if (targetUserId === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    await client.users.deleteUser(targetUserId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin email
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      email,
      firstName,
      lastName,
      password,
      classification,
      paymentType,
      paymentAmount,
    } = body;

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const generatedEmail = `${Date.now()}@emailnotprovided.com`;
    const emailToUse = normalizedEmail || generatedEmail;

    const normalizedPassword = typeof password === "string" ? password : "";
    if (normalizedPassword && normalizedPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters when provided" },
        { status: 400 }
      );
    }
    const passwordToUse = normalizedPassword || "notprovided@123";

    const client = await clerkClient();

    // Create the user
    const newUser = await client.users.createUser({
      emailAddress: [emailToUse],
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      password: passwordToUse,
      unsafeMetadata: {
        classification: classification || null,
        paymentType: paymentType || "unknown",
        paymentSessionId: paymentType === "exempt" ? "exempt" : paymentType === "paid" ? "paid" : null,
        paymentComplete: paymentType === "paid" || paymentType === "exempt",
        paymentAmount: paymentType === "paid" ? (paymentAmount || 39) : null,
        usesPlaceholderEmail: !normalizedEmail,
        isCheckedIn: false,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.emailAddresses[0]?.emailAddress,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
