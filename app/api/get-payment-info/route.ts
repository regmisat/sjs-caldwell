import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment system is not configured" },
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

    // Get the current user to verify they own the session
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session_id from query params
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "No payment session found" },
        { status: 404 }
      );
    }

    // SERVER-SIDE VALIDATION: Verify the session belongs to this user
    const userSessionId = (user.unsafeMetadata as any)?.paymentSessionId;
    if (sessionId !== userSessionId) {
      return NextResponse.json(
        { error: "Forbidden: This session does not belong to you" },
        { status: 403 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "invoice", "invoice.charge"],
    });

    console.log({ session: JSON.stringify(session, null, 2) });

    if (!session) {
      return NextResponse.json(
        { error: "Payment session not found" },
        { status: 404 }
      );
    }

    // Get payment intent details if available
    let paymentIntent = null;
    if (session.payment_intent && typeof session.payment_intent === "object") {
      paymentIntent = session.payment_intent;
    }

    // Try to get the invoice if it exists
    let invoice = null;
    if (session.invoice) {
      if (typeof session.invoice === "string") {
        invoice = await stripe.invoices.retrieve(session.invoice);
      } else {
        invoice = session.invoice;
      }
    }

    // If no invoice directly on session, try to find one by customer
    if (!invoice && session.customer) {
      const invoices = await stripe.invoices.list({
        customer: session.customer as string,
        limit: 1,
      });
      if (invoices.data.length > 0) {
        invoice = invoices.data[0];
      }
    }

    // Construct response
    const paymentInfo = {
      sessionId: session.id,
      status: session.payment_status,
      amountTotal: session.amount_total ? session.amount_total / 100 : 39, // Convert from cents to dollars
      currency: session.currency?.toUpperCase() || "USD",
      customerEmail: session.customer_email,
      created: session.created,
      invoiceUrl: invoice?.hosted_invoice_url || invoice?.invoice_pdf || null,
      receiptUrl:
        paymentIntent && typeof paymentIntent === "object"
          ? (paymentIntent as any).charges?.data[0]?.receipt_url
          : null,
      paymentIntentId: paymentIntent
        ? typeof paymentIntent === "string"
          ? paymentIntent
          : paymentIntent.id
        : null,
    };

    return NextResponse.json(paymentInfo);
  } catch (error) {
    console.error("Error fetching payment info:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment information" },
      { status: 500 }
    );
  }
}
