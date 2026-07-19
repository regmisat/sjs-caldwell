"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REGISTRATION_CLOSED = false;

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    pronouns: "",
    classification: "",
    title: "",
    organization: "",
    phoneNumber: "",
    howDidYouHear: "",
    additionalInfo: "",
  });
  const [mediaConsent, setMediaConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<{
    email: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    if (isLoaded && user && !hasLoadedData) {
      // Pre-fill first and last name from Clerk if available
      console.log({ user });
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        pronouns: (user.unsafeMetadata as any)?.pronouns || "",
        classification: (user.unsafeMetadata as any)?.classification || "",
        title: (user.unsafeMetadata as any)?.title || "",
        organization: (user.unsafeMetadata as any)?.organization || "",
        phoneNumber: (user.unsafeMetadata as any)?.phoneNumber || "",
        howDidYouHear: (user.unsafeMetadata as any)?.howDidYouHear || "",
        additionalInfo: (user.unsafeMetadata as any)?.additionalInfo || "",
      });
      setHasLoadedData(true);

      console.log({
        class: user.unsafeMetadata.classification,
      });

      // if onboarding already complete, redirect to home
      if ((user.unsafeMetadata as any)?.onboardingComplete) {
        router.push("/dashboard");
      }

      // Check if user has already completed onboarding
      //   if ((user.unsafeMetadata as any)?.onboardingComplete) {
      //     router.push("/");
      //   }
    }
  }, [isLoaded, user, hasLoadedData]);

  const proceedToPayment = async () => {
    if (!pendingPaymentData) return;

    try {
      // setShowPaymentDialog(false);
      setIsSubmitting(true);

      // // Create Stripe checkout session
      // const response = await fetch("/api/create-checkout-session", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(pendingPaymentData),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   console.error("Error creating checkout session:", errorData);
      //   throw new Error(errorData.error || "Failed to create checkout session");
      // }

      // const data = await response.json();

      // if (data.url) {
      //   // Redirect to Stripe checkout
      //   window.location.href = data.url;
      // } else {
      //   throw new Error("Failed to create checkout session");
      // }

      const response = await fetch("/api/update-user-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unsafeMetadata: {
            pronouns: formData.pronouns,
            classification: formData.classification,
            title: formData.title,
            organization: formData.organization,
            phoneNumber: formData.phoneNumber,
            howDidYouHear: formData.howDidYouHear,
            additionalInfo: formData.additionalInfo,
            mediaConsent: mediaConsent,
            onboardingComplete: true,
            paymentType: "unknown",
            paymentComplete: false,
            paymentSessionId: null,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user metadata");
      }

      window.location.href = "https://payit.nelnet.net/form/Kf82BNPL";
    } catch (error) {
      console.error("Error processing payment:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
      setIsSubmitting(false);
      setPendingPaymentData(null);
    }
  };

  const cancelPayment = () => {
    setShowPaymentDialog(false);
    setIsSubmitting(false);
    setPendingPaymentData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    console.log({ formData });

    if (!formData.firstName) {
      setError("Please fill in your first name");
      setIsSubmitting(false);
      return;
    }

    if (!formData.lastName) {
      setError("Please fill in your last name");
      setIsSubmitting(false);
      return;
    }

    if (!formData.pronouns) {
      setError("Please select your pronouns");
      setIsSubmitting(false);
      return;
    }

    if (!formData.classification) {
      setError("Please select your classification");
      setIsSubmitting(false);
      return;
    }

    if (!mediaConsent) {
      setError("Please consent to media use");
      setIsSubmitting(false);
      return;
    }

    try {
      // Classifications that don't require payment
      const exemptClassifications = [
        "High School Student",
        "Undergraduate/Graduate Student",
        "Caldwell University Faculty/Staff",
        "Sister of St. Dominic",
        "Speaker/Presenter",
      ];

      const requiresPayment = !exemptClassifications.includes(
        formData.classification
      );

      if (requiresPayment) {
        // Show payment confirmation dialog
        setPendingPaymentData({
          email: user?.primaryEmailAddress?.emailAddress || "",
          userName: `${formData.firstName} ${formData.lastName}`,
        });
        setShowPaymentDialog(true);
        setIsSubmitting(false);
      } else {
        const metadataResponse = await fetch("/api/update-user-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            unsafeMetadata: {
              pronouns: formData.pronouns,
              classification: formData.classification,
              title: formData.title,
              organization: formData.organization,
              phoneNumber: formData.phoneNumber,
              howDidYouHear: formData.howDidYouHear,
              additionalInfo: formData.additionalInfo,
              mediaConsent: mediaConsent,
              onboardingComplete: true,
              // For exempt users, mark payment as complete (no payment needed)
              // If switching from exempt to non-exempt, clear payment fields
              ...(requiresPayment
                ? {
                    paymentComplete: false,
                    paymentSessionId: null,
                  }
                : {
                    paymentComplete: true,
                    paymentSessionId: "exempt",
                  }),
            },
          }),
        });

        if (!metadataResponse.ok) {
          throw new Error("Failed to save registration data");
        }
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
      setIsSubmitting(false);
    }
    // Note: Don't reset isSubmitting if redirecting to Stripe
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    console.log("first");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (REGISTRATION_CLOSED) {
    return (
      <div className="relative min-h-screen">
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/caldwell.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>

        <div className="relative z-10 min-h-screen grid place-content-center px-4">
          <div className="max-w-2xl bg-white rounded-lg p-8 sm:p-10 border border-gray-200 shadow-lg text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Registration Closed
            </h1>
            <p className="text-gray-700 text-lg">
              We are SOLD OUT and registration is now closed! If you have
              questions, please email us at{" "}
              <a
                href="mailto:sji@caldwell.edu"
                className="text-gray-900 underline hover:text-gray-700 transition-colors"
              >
                sji@caldwell.edu
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Fixed Background Layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/caldwell.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Image
              src="/logo_white.png"
              alt="Social Justice Institute"
              width={150}
              height={150}
              className="object-contain mx-auto mb-6"
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 font-serif">
              Welcome to the Social Justice Institute
            </h1>
            <p className="text-white/90 text-lg mt-5">
              Please complete your registration
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-900">
                    First Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter your first name"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-900">
                    Last Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Pronouns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pronouns" className="text-gray-900">
                    Pronouns <span className="text-red-600">*</span>
                  </Label>

                  <Select
                    value={formData.pronouns}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, pronouns: value }))
                    }
                    required
                  >
                    <SelectTrigger id="pronouns">
                      <SelectValue placeholder="Select your pronouns" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300 text-gray-900">
                      <SelectItem value="He/Him">He/Him</SelectItem>
                      <SelectItem value="She/Her">She/Her</SelectItem>
                      <SelectItem value="They/Them">They/Them</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Classification */}
                <div className="space-y-2">
                  <Label htmlFor="classification" className="text-gray-900">
                    Classification <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.classification}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        classification: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger id="classification">
                      <SelectValue placeholder="Select your classification" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300 text-gray-900">
                      <SelectItem value="High School Student">
                        High School Student
                      </SelectItem>
                      <SelectItem value="Undergraduate/Graduate Student">
                        Undergraduate/Graduate Student
                      </SelectItem>
                      <SelectItem value="Caldwell University Faculty/Staff">
                        Caldwell University Faculty/Staff
                      </SelectItem>
                      <SelectItem value="K-12 Educator">
                        K-12 Educator
                      </SelectItem>
                      <SelectItem value="Sister of St. Dominic">
                        Sister of St. Dominic
                      </SelectItem>
                      <SelectItem value="Alumni">Alumni</SelectItem>
                      <SelectItem value="Community Member">
                        Community Member
                      </SelectItem>
                      <SelectItem value="Speaker/Presenter">
                        Speaker/Presenter
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-900">
                  Title/Role
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., Professor, Student, Administrator"
                />
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <Label htmlFor="organization" className="text-gray-900">
                  Organization/Institution
                </Label>
                <Input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., Caldwell University"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-900">
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., (555) 123-4567"
                />
              </div>

              {/* How did you hear about us */}
              <div className="space-y-2">
                <Label htmlFor="howDidYouHear" className="text-gray-900">
                  How did you hear about us?
                </Label>
                <Input
                  type="text"
                  id="howDidYouHear"
                  name="howDidYouHear"
                  value={formData.howDidYouHear}
                  onChange={handleChange}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., Social media, email, word of mouth"
                />
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label htmlFor="additionalInfo" className="text-gray-900">
                  Anything else organizers need to know about you?
                </Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalInfo: e.target.value,
                    }))
                  }
                  className="w-full min-h-[100px] px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y"
                  placeholder="e.g., Dietary restrictions, accessibility needs, or any other relevant information..."
                />
              </div>

              {/* Media Consent */}
              <div className="pt-2">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="mediaConsent"
                    checked={mediaConsent}
                    onChange={(e) => setMediaConsent(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label
                    htmlFor="mediaConsent"
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    I understand that by attending this event, I consent to be
                    photographed and/or video recorded, and grant permission for
                    my likeness to be used in promotional materials, website
                    content, social media posts, and other publications related
                    to the event, without compensation.{" "}
                    <span className="text-red-600">*</span>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {isSubmitting ? "Saving..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          </div>

          <p className="text-center text-white/80 text-sm mt-6">
            Fields marked with <span className="text-red-400">*</span> are
            required
          </p>
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Required</DialogTitle>
            <DialogDescription className="pt-4 text-gray-600">
              To complete your registration, a payment of{" "}
              <span className="font-semibold text-gray-900">$39.00</span> is
              required.
            </DialogDescription>
          </DialogHeader>
          <div>
            <p className="text-sm text-gray-600">
              You will be redirected to our secure payment page to complete your
              registration. Please note that this is non-refundable.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={cancelPayment}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={proceedToPayment}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
