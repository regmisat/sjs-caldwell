"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  donationSuccess?: boolean;
}

const DONATION_URL = "https://secure.qgiv.com/for/socialjusticesymposium";

type DashboardTab = "overview" | "sessions" | "certificate" | "edit";

const DASHBOARD_TABS: {
  key: DashboardTab;
  shortLabel: string;
  label: string;
}[] = [
  { key: "overview", shortLabel: "Overview", label: "Overview" },
  { key: "sessions", shortLabel: "Sessions", label: "Registered Sessions" },
  { key: "certificate", shortLabel: "Certificate", label: "Certificate" },
  { key: "edit", shortLabel: "Profile", label: "Edit Profile" },
];

function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 font-serif">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
        {value}
      </p>
    </div>
  );
}

function CheckInQrPreview({
  userId,
  userName,
  userEmail,
}: {
  userId: string;
  userName: string;
  userEmail: string;
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [open, setOpen] = useState(false);

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        id: userId,
        name: userName,
        email: userEmail,
        event: "Social Justice Institute 2026",
      }),
    [userId, userName, userEmail],
  );

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrPayload, {
      width: 128,
      margin: 1,
      color: { dark: "#111827", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch((error) => {
        console.error("Error generating QR preview:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [qrPayload]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex shrink-0 flex-col items-center"
          aria-label="Open check-in QR code"
        >
          <div className="h-16 w-16 sm:h-[72px] sm:w-[72px] overflow-hidden rounded-md bg-white">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Check-in QR code"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                QR
              </div>
            )}
          </div>
        
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg bg-white border-gray-200 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-gray-900">
            Event Check-In
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Present this QR code at the symposium entrance.
          </DialogDescription>
        </DialogHeader>
        <QRCodeDisplay
          userId={userId}
          userName={userName}
          userEmail={userEmail}
        />
      </DialogContent>
    </Dialog>
  );
}

function DonateCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={[
        "rounded-xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-rose-50",
        compact ? "p-4" : "p-5 sm:p-6",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            className="h-5 w-5"
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
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            Support the Symposium
          </h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
            Your gift helps expand social justice education and community
            programs.
          </p>
          <Button
            onClick={() => window.open(DONATION_URL, "_blank")}
            className="mt-4 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Make a Donation
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  user,
  paymentInfo: _initialPaymentInfo,
  donations: initialDonations,
  donationSuccess = false,
}: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
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

  useEffect(() => {
    if (!donationSuccess) return;
    setDonationMessage({
      type: "success",
      text: "Thank you! Your donation was received successfully.",
    });
    router.replace("/dashboard", { scroll: false });
  }, [donationSuccess, router]);

  const isExempt =
    user.paymentType === "exempt" || user.paymentSessionId === "exempt";
  const isPaid =
    user.paymentType === "paid" && user.paymentSessionId !== "exempt";

  const paymentLabel = isExempt
    ? "Payment Exempt"
    : isPaid
      ? "Paid"
      : "Under Review";

  const paymentDetail = isExempt
    ? "You are exempt from the registration fee."
    : isPaid
      ? `Payment of $${user.paymentAmount || 39} received. Thank you!`
      : "Your payment status is being reviewed. Please check back later.";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateSuccess(false);

    try {
      const response = await fetch("/api/update-user-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
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

  return (
    <div className="relative min-h-screen max-w-screen overflow-x-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/caldwell.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <Header showSchedule={true} />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <div className="mx-auto max-w-6xl">
          {donationMessage && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
                donationMessage.type === "success"
                  ? "border-green-300 bg-green-50"
                  : "border-yellow-300 bg-yellow-50"
              }`}
            >
              <p
                className={`flex-1 text-sm font-medium ${
                  donationMessage.type === "success"
                    ? "text-green-800"
                    : "text-yellow-800"
                }`}
              >
                {donationMessage.text}
              </p>
              <button
                onClick={() => setDonationMessage(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Dismiss"
              >
                <svg
                  className="h-5 w-5"
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
          )}

          {/* Welcome header */}
          <div className="mb-6 sm:mb-8 rounded-2xl border border-white/15 bg-black/35 p-5 sm:p-7 backdrop-blur-sm text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm uppercase tracking-[0.16em] text-white/60">
                  Your account
                </p>
                <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold">
                  Welcome back, {user.firstName || "Guest"}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-white/75 break-all">
                  {user.primaryEmailAddress}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs sm:text-sm font-medium text-emerald-100">
                    Registered
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm font-medium ${
                      isPaid || isExempt
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                        : "border-amber-400/40 bg-amber-500/15 text-amber-100"
                    }`}
                  >
                    {paymentLabel}
                  </span>
                </div>
              </div>
              <CheckInQrPreview
                userId={user.id}
                userName={`${formData.firstName} ${formData.lastName}`.trim()}
                userEmail={user.primaryEmailAddress || ""}
              />
            </div>
          </div>

          {/* Mobile donation (visible early) */}
          <div className="mb-6 lg:hidden">
            <DonateCard />
          </div>

          {/* Tabs — scrollable on mobile */}
          <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div
              role="tablist"
              aria-label="Dashboard sections"
              className="flex gap-1 overflow-x-auto rounded-xl border border-white/15 bg-black/30 p-1 backdrop-blur-sm scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {DASHBOARD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  type="button"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 rounded-lg px-3 py-2.5 text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap transition-colors sm:flex-1 ${
                    activeTab === tab.key
                      ? "bg-white text-gray-900"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-8">
                <SectionCard
                  title="Registration & Payment"
                  description="Your symposium registration details"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Status
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        Registration Complete
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        You&apos;re all set for the Social Justice Symposium.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Payment
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {paymentLabel}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {paymentDetail}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Questions? Contact{" "}
                    <a
                      href="mailto:sji@caldwell.edu"
                      className="font-medium text-red-600 underline underline-offset-2"
                    >
                      sji@caldwell.edu
                    </a>
                  </p>
                </SectionCard>

                <SectionCard
                  title="Event Check-In"
                  description="Present this QR code at the event entrance"
                >
                  <QRCodeDisplay
                    userId={user.id}
                    userName={`${formData.firstName} ${formData.lastName}`}
                    userEmail={user.primaryEmailAddress || ""}
                  />
                </SectionCard>

                <SectionCard
                  title="Personal Information"
                  description="Details from your registration"
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("edit")}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </Button>
                  }
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InfoField
                      label="Name"
                      value={`${formData.firstName} ${formData.lastName}`}
                    />
                    <InfoField
                      label="Pronouns"
                      value={formData.pronouns || "Not specified"}
                    />
                    <InfoField
                      label="Classification"
                      value={formData.classification || "Not specified"}
                    />
                    <InfoField
                      label="Title / Role"
                      value={formData.title || "Not specified"}
                    />
                    <InfoField
                      label="Organization"
                      value={formData.organization || "Not specified"}
                    />
                    <InfoField
                      label="Phone"
                      value={formData.phoneNumber || "Not specified"}
                    />
                    <div className="sm:col-span-2">
                      <InfoField
                        label="Email"
                        value={user.primaryEmailAddress || "Not specified"}
                      />
                    </div>
                    {formData.additionalInfo && (
                      <div className="sm:col-span-2">
                        <InfoField
                          label="Additional Information"
                          value={formData.additionalInfo}
                        />
                      </div>
                    )}
                  </div>
                </SectionCard>

                {initialDonations.length > 0 && (
                  <SectionCard
                    title="Your Donations"
                    description="Thank you for supporting the symposium"
                  >
                    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                      {initialDonations.map((donation) => (
                        <li
                          key={donation.sessionId}
                          className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              ${donation.amount.toFixed(2)}{" "}
                              {donation.currency}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                donation.date * 1000,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          {(donation.receiptUrl || donation.invoiceUrl) && (
                            <a
                              href={
                                donation.receiptUrl ||
                                donation.invoiceUrl ||
                                "#"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-red-600 underline underline-offset-2"
                            >
                              View receipt
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                )}
              </div>

              <aside className="hidden lg:col-span-4 lg:block">
                <div className="sticky top-28 space-y-4">
                  <DonateCard />

                  <div className="rounded-xl border border-white/15 bg-black/35 p-5 text-white backdrop-blur-sm">
                    <h3 className="font-serif text-lg font-semibold">
                      Quick Actions
                    </h3>
                    <div className="mt-4 space-y-2">
                      <Button
                        onClick={() => setActiveTab("sessions")}
                        className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        Registered Sessions
                      </Button>
                      <Button
                        onClick={() => setActiveTab("certificate")}
                        className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        Certificate
                      </Button>
                      <Button
                        onClick={() => router.push("/schedule")}
                        className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        View Schedule
                      </Button>
                      <Button
                        onClick={() => setActiveTab("edit")}
                        className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        Edit Profile
                      </Button>
                      <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        Event Home
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/15 bg-black/35 p-5 text-white backdrop-blur-sm">
                    <h3 className="font-serif text-lg font-semibold">
                      Need Help?
                    </h3>
                    <p className="mt-2 text-sm text-white/70 leading-relaxed">
                      Reach the Social Justice Institute team for registration
                      or payment support.
                    </p>
                    <a
                      href="mailto:sji@caldwell.edu"
                      className="mt-3 inline-block text-sm font-semibold text-white underline underline-offset-4"
                    >
                      sji@caldwell.edu
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="mx-auto max-w-4xl">
              <SectionCard
                title="Registered Sessions"
                description="View your sessions or register for more without leaving the dashboard"
              >
                <RegisteredSessions
                  firstName={formData.firstName}
                  lastName={formData.lastName}
                />
              </SectionCard>
            </div>
          )}

          {activeTab === "certificate" && (
            <div className="mx-auto max-w-4xl">
              <SectionCard
                title="Certificate"
                description="Download your certificate of participation"
              >
                <CertificateDownload
                  firstName={formData.firstName}
                  lastName={formData.lastName}
                />
              </SectionCard>
            </div>
          )}

          {activeTab === "edit" && (
            <div className="mx-auto max-w-3xl">
              <SectionCard
                title="Edit Your Information"
                description="Update the details associated with your registration"
              >
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
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

                  {updateSuccess && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="text-sm text-green-800">
                        Your information has been updated successfully.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-3 sm:flex-row pt-2">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                      size="lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold sm:min-w-[160px]"
                      size="lg"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
