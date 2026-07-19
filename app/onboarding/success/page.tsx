"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const updateUserMetadata = async () => {
      if (!user || !sessionId) return;

      try {
        // Mark payment as complete in user metadata via API
        const response = await fetch("/api/update-user-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            unsafeMetadata: {
              paymentComplete: true,
              paymentSessionId: sessionId,
              onboardingComplete: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update user metadata");
        }

        // Force reload the user to refresh session claims
        await user.reload();

        // Give Clerk a moment to update the session
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refresh the router to update middleware with new session
        // router.refresh();

        router.push("/dashboard");
      } catch (error) {
        console.error("Error updating user metadata:", error);
        setIsProcessing(false);
      }
    };

    updateUserMetadata();
  }, [user, sessionId, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-gray-700">Processing your registration...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Image
            src="/logo_black.png"
            alt="Social Justice Institute"
            width={150}
            height={150}
            className="object-contain mx-auto mb-6"
          />
        </div>

        <div className="bg-white rounded-lg p-8 sm:p-12 border border-gray-200 shadow-lg text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
            Payment Successful!
          </h1>

          <p className="text-lg text-gray-700 mb-2">
            Thank you for registering for the Social Justice Institute.
          </p>

          <p className="text-gray-600 mb-8">
            Your registration is now complete. We look forward to seeing you at
            the event!
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-green-800">
              A confirmation email has been sent to your registered email
              address with your registration details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                // Use window.location to ensure middleware picks up updated session
                window.location.href = "/dashboard";
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold px-6 py-6 text-lg shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              View Event Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
