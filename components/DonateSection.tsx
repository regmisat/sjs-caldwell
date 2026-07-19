"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface DonateSectionProps {
  userEmail?: string;
  userName?: string;
}

export default function DonateSection({
  userEmail,
  userName,
}: DonateSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(2500); // Default $25
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmounts = [
    { value: 1000, label: "$10" },
    { value: 2500, label: "$25" },
    { value: 5000, label: "$50" },
    { value: 10000, label: "$100" },
  ];

  const handleDonate = async () => {
    const donationAmount = customAmount
      ? Math.round(parseFloat(customAmount) * 100)
      : selectedAmount;

    if (!donationAmount || donationAmount < 500) {
      alert("Please enter a donation amount of at least $5");
      return;
    }

    if (donationAmount > 1000000) {
      alert(
        "Maximum donation amount is $10,000. Please contact us for larger donations."
      );
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-donation-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: donationAmount,
          email: userEmail,
          userName: userName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create donation session");
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create donation session");
      }
    } catch (error) {
      console.error("Error creating donation session:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null); // Deselect predefined amounts
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div
            className={`h-12 w-12 rounded-full bg-red-100 flex items-center justify-center transition-transform duration-300 ${
              isHovered ? "scale-110" : ""
            }`}
          >
            <svg
              className="h-7 w-7 text-red-600"
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
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">
            Support Our Mission
          </h3>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Help us continue promoting social justice, equity, and positive
            change in our community. Your generous donation supports future
            Institutes, educational programs, and initiatives that make a real
            difference.
          </p>

          {/* Predefined Amount Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {predefinedAmounts.map((amount) => (
              <button
                key={amount.value}
                onClick={() => {
                  setSelectedAmount(amount.value);
                  setCustomAmount("");
                }}
                className={`py-2 px-3 rounded-md font-semibold text-sm transition-all ${
                  selectedAmount === amount.value
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-red-400 hover:bg-red-50"
                }`}
              >
                {amount.label}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="mb-4">
            <label
              htmlFor="customAmount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Or enter a custom amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <Input
                id="customAmount"
                type="text"
                placeholder="0.00"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="pl-7 bg-white border-gray-300"
              />
            </div>
          </div>

          <Button
            onClick={handleDonate}
            disabled={isProcessing || (!selectedAmount && !customAmount)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Make a Donation
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
