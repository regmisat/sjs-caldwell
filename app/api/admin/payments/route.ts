import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { ADMIN_EMAILS } from "@/utils/CONSTANTS";

export async function GET(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 500 }
      );
    }

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

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });

    // Fetch all checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ["data.customer", "data.payment_intent"],
    });

    // Get all Clerk users to map email addresses
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 500 });

    // Build a map of customer emails to user data and track payment status
    const emailToUserMap = new Map();
    const emailsProcessed = new Set(); // Track all emails we've processed

    clerkUsers.data.forEach((user) => {
      const email = user.emailAddresses[0]?.emailAddress;
      if (email) {
        const metadata = user.unsafeMetadata as any;
        emailToUserMap.set(email, {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: email,
          paymentSessionId: metadata?.paymentSessionId,
          paymentComplete: metadata?.paymentComplete,
          classification: metadata?.classification,
        });
      }
    });

    // Process and enrich session data from Stripe
    const transactions = await Promise.all(
      sessions.data.map(async (session) => {
        const userInfo = session.customer_email
          ? emailToUserMap.get(session.customer_email)
          : null;

        // Track that we've processed this email
        if (session.customer_email) {
          emailsProcessed.add(session.customer_email);
        }

        // Calculate fees and final amount
        const amountTotal = session.amount_total
          ? session.amount_total / 100
          : 0;

        // Stripe fee is typically 2.9% + $0.30
        const stripeFee = amountTotal > 0 ? amountTotal * 0.029 + 0.3 : 0;
        const finalAmount = amountTotal - stripeFee;

        return {
          id: session.id,
          customerEmail: session.customer_email,
          userName: userInfo
            ? `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim()
            : "Unknown",
          userId: userInfo?.userId || null,
          amountTotal: amountTotal,
          stripeFee: parseFloat(stripeFee.toFixed(2)),
          finalAmount: parseFloat(finalAmount.toFixed(2)),
          currency: session.currency?.toUpperCase() || "USD",
          status: session.payment_status,
          created: session.created,
          createdDate: new Date(session.created * 1000).toISOString(),
          classification: userInfo?.classification || null,
        };
      })
    );

    // console.log({ clerkUsers: JSON.stringify(clerkUsers, null, 3) });

    // Add all other users based on their payment status from Clerk metadata
    clerkUsers.data.forEach((user) => {
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) {
        return; // Skip if no email or already processed from Stripe
      }

      const metadata = user.unsafeMetadata as any;
      const paymentSessionId = metadata?.paymentSessionId;

      // Determine status based on paymentSessionId
      let status: string = "no_payment_required";
      if (paymentSessionId === "exempt") {
        status = "exempt";
      } else if (paymentSessionId && paymentSessionId.startsWith("cs_")) {
        // Has a Stripe session ID but not in our Stripe list (shouldn't happen often)
        status = "unknown";
      }

      transactions.push({
        id: `user-${user.id}`,
        customerEmail: email,
        userName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
        userId: user.id,
        amountTotal: 0,
        stripeFee: 0,
        finalAmount: 0,
        currency: "USD",
        status: status as any,
        created: new Date(user.createdAt).getTime() / 1000,
        createdDate: new Date(user.createdAt).toISOString(),
        classification: metadata?.classification || null,
      });

      console.log({
        id: `user-${user.id}`,
        customerEmail: email,
        userName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
        userId: user.id,
        amountTotal: 0,
        stripeFee: 0,
        finalAmount: 0,
        currency: "USD",
        status: status as any,
        created: new Date(user.createdAt).getTime() / 1000,
        createdDate: new Date(user.createdAt).toISOString(),
        classification: metadata?.classification || null,
      });

      emailsProcessed.add(email);
    });

    // Sort by date (newest first)
    transactions.sort((a, b) => b.created - a.created);

    // Calculate totals only for paid transactions
    const paidTransactions = transactions.filter((t) => t.status === "paid");

    return NextResponse.json({
      transactions,
      total: transactions.length,
      totalAmount: paidTransactions.reduce((sum, t) => sum + t.amountTotal, 0),
      totalFees: paidTransactions.reduce((sum, t) => sum + t.stripeFee, 0),
      totalFinal: paidTransactions.reduce((sum, t) => sum + t.finalAmount, 0),
    });
  } catch (error) {
    console.error("Error fetching admin payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment data" },
      { status: 500 }
    );
  }
}
