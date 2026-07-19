import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  console.log("save-donation");
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      console.error("No userId found in auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify the session with Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Invalid or unpaid session" },
        { status: 400 }
      );
    }

    // Get existing donations
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingDonations = (user.unsafeMetadata as any)?.donations || [];

    // Add new donation
    const newDonation = {
      sessionId: session.id,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase() || "USD",
      date: session.created,
      status: session.payment_status,
    };

    // Update user metadata with donation info
    await client.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        ...user.unsafeMetadata,
        donations: [...existingDonations, newDonation],
      },
    });

    console.log("Donation saved successfully:", newDonation);

    return NextResponse.json({ success: true, donation: newDonation });
  } catch (error) {
    console.error("Error saving donation:", error);
    return NextResponse.json(
      { error: "Failed to save donation" },
      { status: 500 }
    );
  }
}
