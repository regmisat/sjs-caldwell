import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  console.log("create-donation-session");
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Payment system is not configured. Please contact support." },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error("NEXT_PUBLIC_APP_URL is not configured");
      return NextResponse.json(
        { error: "App URL is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, email, userName } = await req.json();

    // Validate amount (minimum $5, maximum $10,000)
    if (!amount || amount < 500 || amount > 1000000) {
      return NextResponse.json(
        { error: "Invalid donation amount" },
        { status: 400 }
      );
    }

    console.log({ amount, email, userName });
    console.log({ userId });

    // Create Stripe checkout session for donation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Social Justice Institute Donation",
              description:
                "Support our mission for social justice, equity, and positive change",
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?donation=cancelled`,
      customer_email: email,
      metadata: {
        userId,
        userName,
        donationType: "Institute_support",
      },
      // Enable invoice creation
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description:
            "Donation to Caldwell University's Social Justice Institute",
          metadata: {
            userId,
            userName,
            donationType: "Institute_support",
          },
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating donation session:", error);
    return NextResponse.json(
      { error: "Failed to create donation session" },
      { status: 500 }
    );
  }
}
