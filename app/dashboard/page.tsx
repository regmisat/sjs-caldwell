import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

async function saveDonationToClerk(userId: string, sessionId: string) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return null;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      console.error("Invalid or unpaid session");
      return null;
    }

    // Get existing donations
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingDonations = (user.unsafeMetadata as any)?.donations || [];

    // Check if donation already exists
    const donationExists = existingDonations.some(
      (d: any) => d.sessionId === sessionId
    );

    if (donationExists) {
      console.log("Donation already saved");
      return null;
    }

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
    return newDonation;
  } catch (error) {
    console.error("Error saving donation:", error);
    return null;
  }
}

async function getPaymentInfo(sessionId: string) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return null;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["invoice", "payment_intent.latest_charge"],
    });

    if (!session) {
      return null;
    }

    const receiptUrl = (session?.payment_intent as any)?.latest_charge
      ?.receipt_url;

    // console.log({ session: JSON.stringify(charge, null, 2) });

    let paymentIntent = null;
    if (session.payment_intent && typeof session.payment_intent === "object") {
      paymentIntent = session.payment_intent;
    }

    let invoice = null;
    if (session.invoice) {
      if (typeof session.invoice === "string") {
        invoice = await stripe.invoices.retrieve(session.invoice);
      } else {
        invoice = session.invoice;
      }
    }

    if (!invoice && session.customer) {
      const invoices = await stripe.invoices.list({
        customer: session.customer as string,
        limit: 1,
      });
      if (invoices.data.length > 0) {
        invoice = invoices.data[0];
      }
    }

    return {
      sessionId: session.id,
      status: session.payment_status,
      amountTotal: session.amount_total ? session.amount_total / 100 : 39,
      currency: session.currency?.toUpperCase() || "USD",
      customerEmail: session.customer_email || "",
      created: session.created,
      invoiceUrl: invoice?.hosted_invoice_url || null,
      invoicePdf: invoice?.invoice_pdf || null,
      receiptUrl: receiptUrl || null,
    };
  } catch (error) {
    console.error("Error fetching payment info:", error);
    return null;
  }
}

async function getDonationsInfo(donations: any[]) {
  console.log({
    metaDo: donations,
  });
  if (!donations || donations.length === 0) {
    return [];
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return [];
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });

    const donationsWithInfo = await Promise.all(
      donations.map(async (donation) => {
        try {
          const session = await stripe.checkout.sessions.retrieve(
            donation.sessionId,
            {
              expand: ["invoice", "payment_intent.latest_charge"],
            }
          );

          const receiptUrl = (session?.payment_intent as any)?.latest_charge
            ?.receipt_url;

          let invoice = null;
          if (session.invoice) {
            if (typeof session.invoice === "string") {
              invoice = await stripe.invoices.retrieve(session.invoice);
            } else {
              invoice = session.invoice;
            }
          }

          return {
            ...donation,
            receiptUrl: receiptUrl || null,
            invoiceUrl: invoice?.hosted_invoice_url || null,
            invoicePdf: invoice?.invoice_pdf || null,
          };
        } catch (error) {
          console.error(
            `Error fetching info for donation ${donation.sessionId}:`,
            error
          );
          return donation;
        }
      })
    );

    console.log({
      donationsWithInfo,
    });

    return donationsWithInfo;
  } catch (error) {
    console.error("Error fetching donations info:", error);
    return donations;
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Get the current user from Clerk
  const user = await currentUser();

  // If no user is logged in, redirect to home
  if (!user) {
    redirect("/");
  }

  // Handle donation session from URL
  const params = await searchParams;
  const donationSessionId = params.session_id as string | undefined;

  if (donationSessionId) {
    console.log("Processing donation session:", donationSessionId);
    await saveDonationToClerk(user.id, donationSessionId);
    // Redirect to clean URL
    redirect("/dashboard?donation=success");
  }

  // Extract user metadata
  const metadata = user.unsafeMetadata as any;
  const sessionId = metadata?.paymentSessionId;
  const paymentComplete = metadata?.paymentComplete;
  const onboardingComplete = metadata?.onboardingComplete;

  if (!onboardingComplete) {
    redirect("/onboarding");
  }

  // Fetch payment info if user has a session ID
  let paymentInfo = null;
  if (sessionId) {
    paymentInfo = await getPaymentInfo(sessionId);
    console.log({ paymentInfo });
  }

  // Fetch donations info
  const donations = metadata?.donations || [];
  console.log("Raw donations from metadata:", donations);
  const donationsInfo = await getDonationsInfo(donations);
  console.log("Donations info after processing:", donationsInfo);

  // Serialize donations to ensure they can be passed to client
  const serializedDonations = JSON.parse(JSON.stringify(donationsInfo));
  console.log("Serialized donations:", serializedDonations);

  // Prepare user data for the client component
  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    primaryEmailAddress: user.emailAddresses[0]?.emailAddress || null,
    pronouns: metadata?.pronouns,
    classification: metadata?.classification,
    title: metadata?.title,
    organization: metadata?.organization,
    phoneNumber: metadata?.phoneNumber,
    howDidYouHear: metadata?.howDidYouHear,
    additionalInfo: metadata?.additionalInfo,
    paymentComplete,
    paymentSessionId: sessionId,
    paymentAmount: metadata?.paymentAmount || 0,
    paymentType: metadata?.paymentType || "unknown",
  };

  return (
    <DashboardClient
      user={userData}
      paymentInfo={paymentInfo}
      donations={serializedDonations}
      donationSuccess={params.donation === "success"}
    />
  );
}
