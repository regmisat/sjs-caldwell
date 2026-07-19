"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

interface QRCodeDisplayProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export default function QRCodeDisplay({
  userId,
  userName,
  userEmail,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Generate QR code data - memoize to prevent recreation on every render
  const qrData = useMemo(() => {
    return JSON.stringify({
      id: userId,
      name: userName,
      email: userEmail,
      event: "Social Justice Institute 2026",
      registeredAt: new Date().toISOString(),
    });
  }, [userId, userName, userEmail]);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error);
        }
      );

      // Also generate data URL for download
      QRCode.toDataURL(
        qrData,
        {
          width: 512,
          margin: 2,
        },
        (error, url) => {
          if (error) {
            console.error("Error generating QR data URL:", error);
          } else {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [qrData]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `social-justice-Institute-qr-${userId}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && qrDataUrl) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - Social Justice Institute</title>
            <style>
              body {
                margin: 0;
                padding: 40px;
                font-family: system-ui, -apple-system, sans-serif;
                text-align: center;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
                color: #1f2937;
              }
              .subtitle {
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 30px;
              }
              img {
                max-width: 400px;
                margin: 20px auto;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
              }
              .info {
                margin-top: 30px;
                font-size: 14px;
                color: #4b5563;
              }
              .name {
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 10px;
              }
              @media print {
                body {
                  padding: 20px;
                }
                @page {
                  margin: 1cm;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Social Justice Institute 2026</h1>
              <p class="subtitle">Event Registration QR Code</p>
              <img src="${qrDataUrl}" alt="Registration QR Code" />
              <div class="info">
                <p class="name">${userName}</p>
                <p>${userEmail}</p>
                <p style="margin-top: 20px; font-size: 12px;">
                  Please present this QR code at the event check-in
                </p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Your Event QR Code
        </h3>
        <p className="text-gray-600 mb-4">
          👉 Present this QR code at the event check-in 👈
        </p>

        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="inline-flex items-center"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download QR Code
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="inline-flex items-center"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print QR Code
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          This QR code is unique to your registration and can be scanned at the
          event
        </p>
      </div>
    </div>
  );
}
