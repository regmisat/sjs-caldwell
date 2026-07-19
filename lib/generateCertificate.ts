import jsPDF from "jspdf";

interface Session {
  title: string;
  id?: string;
}

interface CertificateOptions {
  firstName: string;
  lastName: string;
  sessions?: Session[];
  eventName?: string;
  eventDate?: string;
  organizationName?: string;
}

export const generateCertificate = async (options: CertificateOptions) => {
  const {
    firstName,
    lastName,
    sessions = [],
    eventName = "Social Justice Institute",
    eventDate = "February 27, 2026",
    organizationName = "Caldwell University",
  } = options;

  const fullName = `${firstName} ${lastName}`;

  // Load logo image
  const loadImage = (
    src: string,
  ): Promise<{ data: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve({
            data: canvas.toDataURL("image/png"),
            width: img.width,
            height: img.height,
          });
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });
  };

  // Create PDF in landscape orientation
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor: [number, number, number] = [139, 0, 0]; // Dark red (Caldwell color)
  const goldColor: [number, number, number] = [184, 134, 11]; // Gold accent
  const darkGray: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [128, 128, 128];

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Decorative border - outer
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(3);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Decorative border - inner
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(1);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Corner decorations
  const cornerSize = 15;
  const corners = [
    { x: 12, y: 12 }, // top-left
    { x: pageWidth - 12 - cornerSize, y: 12 }, // top-right
    { x: 12, y: pageHeight - 12 - cornerSize }, // bottom-left
    { x: pageWidth - 12 - cornerSize, y: pageHeight - 12 - cornerSize }, // bottom-right
  ];

  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.5);
  corners.forEach((corner) => {
    // Draw decorative L-shapes at corners
    doc.line(corner.x, corner.y, corner.x + cornerSize, corner.y);
    doc.line(corner.x, corner.y, corner.x, corner.y + cornerSize);
    doc.line(
      corner.x + cornerSize,
      corner.y + cornerSize,
      corner.x,
      corner.y + cornerSize,
    );
    doc.line(
      corner.x + cornerSize,
      corner.y + cornerSize,
      corner.x + cornerSize,
      corner.y,
    );
  });

  // Header decorative line (positioned below where logo will be)
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.75);
  doc.line(60, 45, pageWidth - 60, 45);

  // Small decorative diamond in the center of header line
  const diamondCenterX = pageWidth / 2;
  const diamondCenterY = 45;
  const diamondSize = 3;
  doc.setFillColor(...goldColor);
  doc.triangle(
    diamondCenterX,
    diamondCenterY - diamondSize,
    diamondCenterX - diamondSize,
    diamondCenterY,
    diamondCenterX + diamondSize,
    diamondCenterY,
    "F",
  );
  doc.triangle(
    diamondCenterX,
    diamondCenterY + diamondSize,
    diamondCenterX - diamondSize,
    diamondCenterY,
    diamondCenterX + diamondSize,
    diamondCenterY,
    "F",
  );

  // Add logo at the top center
  try {
    const logo = await loadImage("/logo_black.png");
    // Calculate dimensions preserving aspect ratio
    const maxLogoHeight = 22; // mm - max height
    const aspectRatio = logo.width / logo.height;
    const logoHeight = maxLogoHeight;
    const logoWidth = logoHeight * aspectRatio;
    const logoX = pageWidth / 2 - logoWidth / 2;
    const logoY = 18; // Position near top
    doc.addImage(logo.data, "PNG", logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.warn("Could not load logo:", error);
    // Continue without logo if it fails to load
  }

  // Certificate title (positioned below logo)
  doc.setTextColor(...primaryColor);
  doc.setFontSize(42);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATE", pageWidth / 2, 66, { align: "center" });

  // Subtitle
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightGray);
  doc.text("OF PARTICIPATION", pageWidth / 2, 76, { align: "center" });

  // "This certifies that" text
  doc.setFontSize(12);
  doc.setTextColor(...darkGray);
  doc.text("This is to certify that", pageWidth / 2, 91, { align: "center" });

  // Recipient name with decorative underline
  doc.setFontSize(36);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...primaryColor);
  doc.text(fullName, pageWidth / 2, 108, { align: "center" });

  // Decorative underline for name
  const nameWidth = doc.getTextWidth(fullName);
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.5);
  doc.line(
    pageWidth / 2 - nameWidth / 2 - 10,
    113,
    pageWidth / 2 + nameWidth / 2 + 10,
    113,
  );

  // Participation text
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkGray);
  doc.text("has successfully participated in the", pageWidth / 2, 126, {
    align: "center",
  });

  // Event name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(eventName, pageWidth / 2, 140, { align: "center" });

  // Event date
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightGray);
  doc.text(`held on ${eventDate}`, pageWidth / 2, 150, { align: "center" });

  // Sessions attended section (if sessions provided) - 3 columns, 2 rows max
  const hiddenSessionTitles = new Set([
    // "Registration and Continental Breakfast",
    // "Opening Remarks",
    // "Key Takeaways and Call to Action",
    "",
  ]);
  const visibleSessions = sessions.filter((session) => {
    const normalizedTitle = session.title.trim().toLowerCase();
    return !Array.from(hiddenSessionTitles).some(
      (hidden) => hidden.toLowerCase() === normalizedTitle,
    );
  });

  if (visibleSessions.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...darkGray);
    doc.text("Sessions Attended:", pageWidth / 2, 162, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    const maxSessionsToShow = Math.min(visibleSessions.length, 6); // 3 columns x 2 rows = 6 max
    const numColumns = 3;
    const columnGap = 8;
    const blockMargin = 25;
    const blockWidth = pageWidth - blockMargin * 2;
    const columnWidth =
      (blockWidth - columnGap * (numColumns - 1)) / numColumns;
    const blockStartX = (pageWidth - blockWidth) / 2;
    const startY = 169;
    const rowHeight = 8;
    const bullet = "•";

    const trimToWidth = (text: string, maxWidth: number) => {
      if (doc.getTextWidth(text) <= maxWidth) {
        return text;
      }
      const ellipsis = "...";
      const targetWidth = maxWidth - doc.getTextWidth(ellipsis);
      let trimmed = text;
      while (trimmed.length > 0 && doc.getTextWidth(trimmed) > targetWidth) {
        trimmed = trimmed.slice(0, -1);
      }
      return `${trimmed}${ellipsis}`;
    };

    const items = visibleSessions.slice(0, maxSessionsToShow);

    // Calculate how many items are in each row for centering
    const itemsInRow0 = Math.min(items.length, numColumns);
    const itemsInRow1 = Math.max(0, items.length - numColumns);

    items.forEach((session, index) => {
      const column = index % numColumns; // 0, 1, or 2
      const row = Math.floor(index / numColumns); // 0 or 1

      // Calculate offset to center incomplete rows
      const itemsInThisRow = row === 0 ? itemsInRow0 : itemsInRow1;
      const rowOffset =
        ((numColumns - itemsInThisRow) * (columnWidth + columnGap)) / 2;

      // Calculate column X position with centering offset
      const columnX =
        blockStartX + column * (columnWidth + columnGap) + rowOffset;
      const y = startY + row * rowHeight;

      // Trim title to fit column width
      const maxTextWidth = columnWidth - 5;
      const trimmedTitle = trimToWidth(session.title, maxTextWidth);
      const fullText = `${bullet} ${trimmedTitle}`;

      // Center text within column
      const textWidth = doc.getTextWidth(fullText);
      const centeredX = columnX + columnWidth / 2 - textWidth / 2;

      doc.text(fullText, centeredX, y);
    });

    // if (visibleSessions.length > 6) {
    //   doc.setFontSize(7);
    //   doc.setTextColor(...lightGray);
    //   const moreTextY = startY + 2 * rowHeight + 3;
    //   doc.text(
    //     `+${visibleSessions.length - 6} more session(s)`,
    //     pageWidth / 2,
    //     moreTextY,
    //     { align: "center" },
    //   );
    // }
  }

  // Footer decorative line
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.75);
  doc.line(60, pageHeight - 28, pageWidth - 60, pageHeight - 28);

  // Date of Issue section (centered)
  const signatureY = pageHeight - 18;
  const signatureWidth = 80;

  // Centered date signature
  //   doc.setDrawColor(...darkGray);
  //   doc.setLineWidth(0.3);
  //   doc.line(
  //     pageWidth / 2 - signatureWidth / 2,
  //     signatureY,
  //     pageWidth / 2 + signatureWidth / 2,
  //     signatureY,
  //   );
  doc.setFontSize(8);
  doc.setTextColor(...lightGray);

  // Add current date above the signature line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  const issueDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.text(`Issued on ${issueDate}`, pageWidth / 2, signatureY - 3, {
    align: "center",
  });

  // Certificate ID (small, at bottom)
  const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}`;

  // Generate and download
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);

  // Create download link
  const link = document.createElement("a");
  link.href = url;
  link.download = `Certificate_${firstName}_${lastName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Also open in new tab
  window.open(url, "_blank");

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);

  return true;
};

// Simple version for use in components
export const handleCertificateDownload = async (
  firstName: string,
  lastName: string,
  sessions: Session[] = [],
): Promise<boolean> => {
  try {
    await generateCertificate({
      firstName,
      lastName,
      sessions,
      eventName: "Social Justice Institute",
      eventDate: "February 27, 2026",
      organizationName: "Caldwell University",
    });

    return true;
  } catch (error) {
    console.error("Error generating certificate:", error);
    return false;
  }
};
