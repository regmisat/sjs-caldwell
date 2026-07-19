import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrData } = body;

    if (!qrData) {
      return NextResponse.json(
        { error: "QR data is required" },
        { status: 400 }
      );
    }

    // Parse the QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid QR code format" },
        { status: 400 }
      );
    }

    const { id: userId } = parsedData;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in QR code" },
        { status: 400 }
      );
    }

    // Fetch user data from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const metadata = user.unsafeMetadata as any;

    // Verify registration is complete
    const registrationComplete =
      metadata?.paymentComplete || metadata?.onboardingComplete;

    if (!registrationComplete) {
      return NextResponse.json(
        { error: "Registration not complete" },
        { status: 403 }
      );
    }

    await client.users.updateUser(userId, {
      unsafeMetadata: {
        ...metadata,
        isCheckedIn: true,
      },
    });

    // Determine payment status
    const isExempt = metadata?.paymentSessionId === "exempt";
    const isPaid = metadata?.paymentComplete && metadata?.paymentAmount;

    // Return user information for verification
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        pronouns: metadata?.pronouns,
        classification: metadata?.classification,
        title: metadata?.title,
        organization: metadata?.organization,
        paymentComplete: metadata?.paymentComplete,
        isExempt: isExempt,
        isPaid: isPaid,
        isCheckedIn: true,
        registeredAt: parsedData.registeredAt || null,
        amt: metadata?.paymentAmount || null,
      },
    });
  } catch (error) {
    console.error("Error verifying QR code:", error);
    return NextResponse.json(
      { error: "Failed to verify QR code" },
      { status: 500 }
    );
  }
}
