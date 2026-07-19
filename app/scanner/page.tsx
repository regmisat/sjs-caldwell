"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BrowserQRCodeReader } from "@zxing/library";

interface ScannedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pronouns?: string;
  classification?: string;
  title?: string;
  organization?: string;
  paymentComplete?: boolean;
  isExempt?: boolean;
  isPaid?: boolean;
  registeredAt?: string;
  amt?: number;
}

export default function QRScannerPage() {
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const hasScannedRef = useRef(false);

  const verifyQRCode = async (qrData: string) => {
    // Prevent duplicate scans
    if (hasScannedRef.current) {
      return;
    }

    hasScannedRef.current = true;

    // Stop scanner immediately to prevent multiple scans
    stopScanning();

    setIsLoading(true);
    setError(null);
    setScannedUser(null);

    try {
      const response = await fetch("/api/verify-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      if (data.success) {
        setScannedUser(data.user);
        // Play success sound (optional)
        playSuccessSound();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      // Play error sound (optional)
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      hasScannedRef.current = false;

      // Request camera permission explicitly
      console.log("Requesting camera permission...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile devices
      });

      // Permission granted, now initialize the QR code reader
      console.log("Camera permission granted");

      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserQRCodeReader();
      }

      if (videoRef.current) {
        const controls = await codeReaderRef.current.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, error) => {
            if (result && !hasScannedRef.current) {
              const qrData = result.getText();
              console.log("QR Code detected:", qrData);
              verifyQRCode(qrData);
            }
          }
        );
      }
    } catch (err) {
      console.error("Scanner error:", err);

      // Provide more specific error messages
      let errorMessage = "Failed to access camera.";
      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          errorMessage =
            "Camera permission denied. Please allow camera access in your browser settings and try again.";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          errorMessage = "No camera found on this device.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          errorMessage = "Camera is already in use by another application.";
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }

      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const playSuccessSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUQ4MW6vn77BdGAg+ltryxnMnBi17y/DajDgKE2O56O2lThALTKXh8bllHAU2jNXyzn0vBSh+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBQ=="
    );
    audio.play().catch(() => {});
  };

  const playErrorSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUQ4MW6vn77BdGAg+ltryxnMnBi17y/DajDgKE2O56O2lThALTKXh8bllHAU2jNXyzn0vBSh+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBSl+zPLaizsKElyx6+yiUhAMUKjo8LdnGwY8lNjzyn4qBQ=="
    );
    audio.play().catch(() => {});
  };

  const reset = () => {
    setScannedUser(null);
    setError(null);
    hasScannedRef.current = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Image
            src="/logo_black.png"
            alt="Social Justice Institute"
            width={120}
            height={120}
            className="object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-serif">
            Event Check-In Scanner
          </h1>
          <p className="text-gray-600">
            Scan attendee QR codes to verify registration
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
          {/* Camera Section */}
          {!scannedUser && !isLoading && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Scan QR Code
              </h2>
              <div className="space-y-4">
                {!isScanning ? (
                  <Button
                    onClick={startScanning}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                    size="lg"
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
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Start Camera Scanner
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Camera Feed */}
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-auto"
                        style={{ maxHeight: "500px" }}
                      />
                      {/* Scanning overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="border-4 border-red-500 rounded-lg"
                          style={{ width: "250px", height: "250px" }}
                        ></div>
                      </div>
                      {/* Scanning text */}
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-white bg-black bg-opacity-50 px-4 py-2 rounded inline-block">
                          Position QR code within the frame
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={stopScanning}
                      variant="outline"
                      className="w-full"
                    >
                      Stop Camera
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <svg
                  className="h-8 w-8 text-red-600"
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
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Verification Failed
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <Button
                onClick={reset}
                variant="outline"
                className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Success Display */}
          {scannedUser && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
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
                <div>
                  <h3 className="text-xl font-bold text-green-900">
                    Registration Verified
                  </h3>
                  <p className="text-green-700">Valid attendee</p>
                </div>
              </div>

              <div className="bg-white border border-green-200 rounded-lg p-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {scannedUser.firstName} {scannedUser.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base font-medium text-gray-900 truncate">
                      {scannedUser.email}
                    </p>
                  </div>
                  {scannedUser.pronouns && (
                    <div>
                      <p className="text-sm text-gray-600">Pronouns</p>
                      <p className="text-base font-medium text-gray-900">
                        {scannedUser.pronouns}
                      </p>
                    </div>
                  )}
                  {scannedUser.classification && (
                    <div>
                      <p className="text-sm text-gray-600">Classification</p>
                      <p className="text-base font-medium text-gray-900">
                        {scannedUser.classification}
                      </p>
                    </div>
                  )}
                  {scannedUser.organization && (
                    <div>
                      <p className="text-sm text-gray-600">Organization</p>
                      <p className="text-base font-medium text-gray-900">
                        {scannedUser.organization}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="text-base font-medium text-gray-900">
                      {scannedUser.isPaid ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                          ✓ Paid{" "}
                          {scannedUser?.amt ? `($${scannedUser?.amt})` : ""}
                        </span>
                      ) : scannedUser.isExempt ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                          ✓ Exempt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={reset}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                size="lg"
              >
                Scan Next Attendee
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
