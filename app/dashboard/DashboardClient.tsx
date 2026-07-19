"use client";

import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import QRCodeDisplay from "@/components/QRCodeDisplay";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisteredSessions from "@/components/RegisteredSessions";
import CertificateDownload from "@/components/CertificateDownload";

interface PaymentInfo {
  sessionId: string;
  status: string;
  amountTotal: number;
  currency: string;
  customerEmail: string;
  created: number;
  invoiceUrl: string | null;
  invoicePdf: string | null;
  receiptUrl: string | null;
}

interface DonationInfo {
  sessionId: string;
  amount: number;
  currency: string;
  date: number;
  status: string;
  receiptUrl?: string | null;
  invoiceUrl?: string | null;
  invoicePdf?: string | null;
}

interface DashboardClientProps {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    primaryEmailAddress: string | null;
    pronouns?: string;
    classification?: string;
    title?: string;
    organization?: string;
    phoneNumber?: string;
    howDidYouHear?: string;
    additionalInfo?: string;
    requiresPayment?: boolean;
    paymentComplete?: boolean;
    paymentSessionId?: string;
    paymentAmount?: number;
    paymentType?: "paid" | "exempt" | "unknown";
  };
  paymentInfo: PaymentInfo | null;
  donations: DonationInfo[];
}

export default function DashboardClient({
  user,
  paymentInfo: initialPaymentInfo,
  donations: initialDonations,
}: DashboardClientProps) {
  console.log("DashboardClient received donations:", initialDonations);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview");
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    pronouns: user.pronouns || "",
    classification: user.classification || "",
    title: user.title || "",
    organization: user.organization || "",
    phoneNumber: user.phoneNumber || "",
    howDidYouHear: user.howDidYouHear || "",
    additionalInfo: user.additionalInfo || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [donationMessage, setDonationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const exemptClassifications = [
    "High School Student",
    "Undergraduate/Graduate Student",
    "Caldwell University Faculty/Staff",
    "Sister of St. Dominic",
    "Speaker/Presenter",
  ];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateSuccess(false);

    try {
      const response = await fetch("/api/update-user-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log({
        response,
      });

      if (response.ok) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        // Refresh the page to get updated data
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  console.log({ user });

  return (
    <div className="relative max-w-screen min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/caldwell.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      </div>

      <Header showSchedule={true} />

      {/* Content Layer */}
      <div className="relative z-10 pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-4xl mx-auto">
          {/* Donation Status Notification */}
          {donationMessage && (
            <div
              className={`mb-6 rounded-lg p-4 border-2 ${
                donationMessage.type === "success"
                  ? "bg-green-50 border-green-300"
                  : "bg-yellow-50 border-yellow-300"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {donationMessage.type === "success" ? (
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      donationMessage.type === "success"
                        ? "text-green-800"
                        : "text-yellow-800"
                    }`}
                  >
                    {donationMessage.text}
                  </p>
                </div>
                <button
                  onClick={() => setDonationMessage(null)}
                  className="flex-shrink-0 ml-auto"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8 relative text-white">
            {/* <Image
              src="/logo_white.png"
              alt="Social Justice Institute"
              width={120}
              height={120}
              className="object-contain mx-auto mb-4"
            /> */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-serif">
              Dashboard
            </h1>
            <p className="mb-4">Welcome back, {user.firstName || "User"}!</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-t-lg shadow-lg border border-gray-200 border-b-0">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === "overview"
                    ? "bg-red-50 text-red-700 border-b-2 border-red-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === "edit"
                    ? "bg-red-50 text-red-700 border-b-2 border-red-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Edit Information
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 p-6 sm:p-8">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                {/* Registration Status */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    Registration Status
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-gray-600"
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
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Registration Complete
                        </h3>
                        <p className="text-sm text-gray-700">
                          You're all set for the Social Justice Institute!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    Payment Information
                  </h2>
                  {}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-2">
                    <p className="">
                      {(user.paymentType === "exempt" ||
                        user.paymentSessionId === "exempt") && (
                        <> You are exempt from payment.</>
                      )}
                      {user.paymentType === "paid" &&
                        user.paymentSessionId !== "exempt" && (
                          <>
                            Your payment of{" "}
                            <span className="font-bold">
                              ${user.paymentAmount || 39}
                            </span>{" "}
                            has been received. Thank you!
                          </>
                        )}
                      {user.paymentType === "unknown" &&
                        user.paymentSessionId !== "exempt" && (
                          <>
                            Your payment status is being reviewed. Please check
                            back later.
                          </>
                        )}
                    </p>

                    <p>
                      Please contact{" "}
                      <a
                        href="mailto:sji@caldwell.edu"
                        className="text-red-600 underline"
                      >
                        sji@caldwell.edu
                      </a>{" "}
                      for any payment-related questions.
                    </p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    Event Check-In
                  </h2>
                  <QRCodeDisplay
                    userId={user.id}
                    userName={`${formData.firstName} ${formData.lastName}`}
                    userEmail={user.primaryEmailAddress || ""}
                  />
                </div>

                {/* Registered Sessions */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    Registered Sessions
                  </h2>
                  <RegisteredSessions
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                  />
                </div>

                {/* Certificate Download */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    Certificate
                  </h2>
                  <CertificateDownload
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                  />
                </div>

                {/* Personal Information */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    Personal Information
                  </h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Name</p>
                        <p className="text-base font-medium text-gray-900">
                          {formData.firstName} {formData.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Pronouns</p>
                        <p className="text-base font-medium text-gray-900">
                          {formData.pronouns || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Classification
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {formData.classification || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Title/Role</p>
                        <p className="text-base font-medium text-gray-900">
                          {formData.title || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Organization
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {formData.organization || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Phone Number
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {formData.phoneNumber || "Not specified"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="text-base font-medium text-gray-900">
                          {user.primaryEmailAddress}
                        </p>
                      </div>
                      {formData.additionalInfo && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600 mb-1">
                            Additional Information
                          </p>
                          <p className="text-base font-medium text-gray-900">
                            {formData.additionalInfo}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Donate Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                    Make a Difference
                  </h2>
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Support the Social Justice Institute
                        </h3>
                        <p className="text-sm text-gray-700 mb-4">
                          Your donation helps us continue our mission to promote
                          social justice education and create positive change in
                          our community.
                        </p>
                        <Button
                          onClick={() =>
                            window.open(
                              "https://secure.qgiv.com/for/socialjusticesymposium",
                              "_blank",
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all"
                        >
                          <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          Make a Donation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-y-8 justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Button
                      onClick={() => router.push("/")}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-6 text-base shadow-lg hover:shadow-xl transition-all border-2 border-transparent"
                      size="lg"
                    >
                      Go to Event Page
                    </Button>
                    <Button
                      onClick={() => setActiveTab("edit")}
                      variant="outline"
                      className="border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold px-6 py-6 text-base shadow-md hover:shadow-lg transition-all"
                      size="lg"
                    >
                      Edit Information
                    </Button>
                  </div>

                  <SignOutButton>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-6 text-base shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Log Out
                    </Button>
                  </SignOutButton>
                </div>
              </div>
            ) : (
              // Edit Form
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">
                  Edit Your Information
                </h2>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
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
                        className="bg-white border-gray-300 text-gray-900"
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
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>

                    {/* Pronouns */}
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
                        <SelectContent className="bg-white">
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
                        <SelectContent className="bg-white">
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
                      className="bg-white border-gray-300 text-gray-900"
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
                      className="bg-white border-gray-300 text-gray-900"
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
                      className="bg-white border-gray-300 text-gray-900"
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
                      className="bg-white border-gray-300 text-gray-900"
                      placeholder="e.g., Social media, email, word of mouth"
                    />
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo" className="text-gray-900">
                      Additional Information
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
                      className="w-full min-h-[100px] bg-white border-gray-300 text-gray-900"
                      placeholder="Dietary restrictions, accessibility needs, etc."
                    />
                  </div>

                  {/* Success Message */}
                  {updateSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        ✓ Your information has been updated successfully!
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-6 text-base shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      variant="outline"
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-6 text-base"
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
