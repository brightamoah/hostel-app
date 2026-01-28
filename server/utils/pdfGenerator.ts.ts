import { jsPDF as JsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Buffer } from "node:buffer";

import { formatDate, formatMoney } from "./formatters";

// --- Configuration ---
const PRIMARY_COLOR = "#214d49";
const TEXT_COLOR = "#333333";
const GRAY_COLOR = "#666666";
const BG_COLOR = "#f8f9fa";
const BORDER_COLOR = "#dee2e6";

// Map billing statuses to HEX codes (replicating your UI colors)
const STATUS_COLORS: Record<string, string> = {
  "fully paid": "#16a34a", // Success Green
  "partially paid": "#d97706", // Warning Amber
  "unpaid": "#dc2626", // Error Red
  "overdue": "#991b1b", // Dark Red
  "cancelled": "#6b7280", // Neutral Gray
};

function getDaysDiff(start: Date | string, end: Date | string) {
  const date1 = new Date(start);
  const date2 = new Date(end);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 30; // Default to 30 if invalid
}

export function generateInvoicePDF(billing: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const PAGE_WIDTH = doc.internal.pageSize.width; // 210mm
    const MARGIN = 15;
    let y = 20;

    // --- 1. Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text("Kings Hostel Management", PAGE_WIDTH / 2, y, { align: "center" });

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(GRAY_COLOR);
    doc.text(billing.hostel?.address || "University Campus, Accra, Ghana", PAGE_WIDTH / 2, y, { align: "center" });

    y += 5;
    doc.text(`${billing.hostel?.email || "kingshostelmgt@gmail.com"} | ${billing.hostel?.contactNumber || "+233 30 277 8899"}`, PAGE_WIDTH / 2, y, { align: "center" });

    y += 8;
    doc.setDrawColor(PRIMARY_COLOR);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

    // --- 2. Invoice Meta Data ---
    y += 10;
    const col2X = PAGE_WIDTH / 2 + 10;
    const labelOffset = 35; // Reduced from previous to tighten gap

    // Left Column
    doc.setFontSize(10);
    doc.setTextColor(TEXT_COLOR);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE ID:", MARGIN, y);
    doc.setTextColor(TEXT_COLOR);
    doc.setFont("helvetica", "normal");
    doc.text(billing.invoiceNumber || `INV-${String(billing.id).padStart(6, "0")}`, MARGIN + 25, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Date Issued:", MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(billing.dateIssued), MARGIN + 25, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Due Date:", MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(billing.dueDate), MARGIN + 25, y);

    // Right Column (Reset Y)
    y -= 12;

    // Status
    doc.setFont("helvetica", "bold");
    doc.setTextColor(TEXT_COLOR);
    doc.text("Status:", col2X, y);

    const statusKey = billing.status?.toLowerCase();
    const statusHex = STATUS_COLORS[statusKey] || TEXT_COLOR;
    doc.setTextColor(statusHex);
    doc.text(billing.status?.toUpperCase() || "UNPAID", col2X + labelOffset, y);

    // Period
    y += 6;
    doc.setTextColor(TEXT_COLOR);
    doc.setFont("helvetica", "bold");
    doc.text("Period:", col2X, y);
    doc.setFont("helvetica", "normal");
    doc.text(billing.academicPeriod || "N/A", col2X + labelOffset, y);

    // Purpose
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Purpose:", col2X, y);
    doc.setFont("helvetica", "normal");
    doc.text(billing.type || "Hostel Fee", col2X + labelOffset, y);

    // --- 3. "Billed To" Box ---
    y += 12;
    const boxHeight = 42; // Increased height for better spacing
    doc.setFillColor(BG_COLOR);
    doc.setDrawColor(PRIMARY_COLOR);
    doc.rect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), boxHeight, "F");
    doc.setFillColor(PRIMARY_COLOR);
    doc.rect(MARGIN, y, 1.5, boxHeight, "F");

    let boxY = y + 10; // More top padding
    const boxX = MARGIN + 8; // More left padding

    doc.setFont("helvetica", "bold");
    doc.setTextColor(PRIMARY_COLOR);
    doc.text("Billed To:", boxX, boxY);

    boxY += 8; // Increased spacing
    doc.setTextColor(TEXT_COLOR);
    doc.setFontSize(11);
    doc.text(billing.student?.user?.name?.toUpperCase() || "Unknown Student", boxX, boxY);

    boxY += 6; // Increased spacing
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GRAY_COLOR);
    doc.text(`Student ID: ${billing.student?.id || "N/A"}`, boxX, boxY);

    boxY += 5; // Increased spacing
    doc.text(`Email: ${billing.student?.user?.email}`, boxX, boxY);

    boxY += 5; // Increased spacing
    doc.text(`Phone: ${billing.student?.phoneNumber || "N/A"}`, boxX, boxY);

    y += boxHeight + 8; // Move cursor past box

    // --- 4. Items Table ---
    const subtotal = Number(billing.amount);
    const lateFee = Number(billing.lateFee || 0);
    const total = subtotal + lateFee;
    const paid = Number(billing.paidAmount || 0);
    const balance = total - paid;

    autoTable(doc, {
      startY: y,
      head: [["#", "Description", "Amount"]],
      body: [
        ["1", billing.description || billing.type || "Hostel Fee", formatMoney(subtotal)],
      ],
      theme: "grid",
      headStyles: { fillColor: PRIMARY_COLOR, textColor: 255, fontStyle: "bold", halign: "left" },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 40, halign: "right" },
      },
      styles: { fontSize: 10, cellPadding: 3, lineColor: [222, 226, 230], lineWidth: 0.1 },
      margin: { left: MARGIN, right: MARGIN },
    });

    // @ts-expect-error jsPDF autoTable plugin extends doc with lastAutoTable property
    y = doc.lastAutoTable.finalY + 8;

    // --- 5. Totals Section ---
    const rightColLabelX = 140;
    const rightColValueX = 195;

    doc.setFontSize(10);

    const addRow = (label: string, value: string, isBold = false, color = TEXT_COLOR, borderTop = false) => {
      if (borderTop) {
        doc.setDrawColor(PRIMARY_COLOR);
        doc.line(rightColLabelX, y - 4, PAGE_WIDTH - MARGIN, y - 4);
      }

      doc.setTextColor(GRAY_COLOR);
      doc.setFont("helvetica", "bold");
      doc.text(label, rightColLabelX, y);

      doc.setTextColor(color);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.text(value, rightColValueX, y, { align: "right" });
      y += 6;
    };

    addRow("Subtotal:", formatMoney(subtotal));
    addRow("Tax (0%):", formatMoney(0));
    y += 2;
    addRow("Total:", formatMoney(total), true, TEXT_COLOR, true);
    addRow("Amount Paid:", formatMoney(paid), true, STATUS_COLORS["fully paid"]);
    addRow("Balance Due:", formatMoney(balance), true, STATUS_COLORS.unpaid);

    // --- 6. Payment Info Box ---
    y += 8;

    doc.setFillColor(BG_COLOR);
    doc.setDrawColor(BORDER_COLOR);
    doc.rect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 28, "FD");

    let payY = y + 7;
    const payX = MARGIN + 5;

    doc.setTextColor(PRIMARY_COLOR);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Payment Information", payX, payY);

    payY += 6;
    doc.setFontSize(9);
    doc.setTextColor(TEXT_COLOR);

    doc.setFont("helvetica", "bold");
    doc.text("Bank Name:", payX, payY);
    doc.setFont("helvetica", "normal");
    doc.text("Ghana Commercial Bank", payX + 25, payY);

    doc.setFont("helvetica", "bold");
    doc.text("Account No:", payX + 85, payY);
    doc.setFont("helvetica", "normal");
    doc.text("1234567890", payX + 110, payY);

    payY += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Account Name:", payX, payY);
    doc.setFont("helvetica", "normal");
    doc.text("Kings Hostel Management", payX + 25, payY);

    doc.setFont("helvetica", "bold");
    doc.text("Mobile Money:", payX + 85, payY);
    doc.setFont("helvetica", "normal");
    doc.text("+233 54 968 4848", payX + 110, payY);

    y += 38;

    // --- 7. Transaction History ---
    doc.setTextColor(PRIMARY_COLOR);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction History", MARGIN, y);
    y += 2;

    const historyData = billing.payments && billing.payments.length > 0
      ? billing.payments.map((p: any) => [
          formatDate(p.paymentDate),
          p.paymentMethod.replace("_", " ").toUpperCase(),
          formatMoney(p.amount),
        ])
      : [];

    if (historyData.length > 0) {
      autoTable(doc, {
        startY: y + 4,
        head: [["Date", "Payment Method", "Amount"]],
        body: historyData,
        theme: "grid",
        headStyles: { fillColor: BG_COLOR, textColor: TEXT_COLOR, fontStyle: "bold", lineColor: BORDER_COLOR, lineWidth: 0.1 },
        columnStyles: { 2: { halign: "right" } },
        styles: { fontSize: 9, lineColor: BORDER_COLOR, lineWidth: 0.1 },
        margin: { left: MARGIN, right: MARGIN },
      });
      // @ts-expect-error: jsPDF autoTable plugin extends doc with lastAutoTable property
      y = doc.lastAutoTable.finalY + 10;
    }
    else {
      y += 4;
      doc.setDrawColor(BORDER_COLOR);
      doc.rect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 12);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(GRAY_COLOR);
      doc.text("No payment transactions recorded", PAGE_WIDTH / 2, y + 8, { align: "center" });
      y += 20;
    }

    // --- 8. Terms & Conditions (With Dynamic Calculation) ---
    doc.setFillColor(BG_COLOR);
    doc.setDrawColor(BORDER_COLOR);
    doc.rect(MARGIN, y, PAGE_WIDTH - (MARGIN * 2), 35, "FD");

    y += 7;
    doc.setTextColor(PRIMARY_COLOR);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Terms & Conditions", MARGIN + 5, y);

    y += 5;
    doc.setTextColor(TEXT_COLOR);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // CALCULATE DAYS
    const dueInDays = getDaysDiff(billing.dateIssued, billing.dueDate);

    const terms = [
      `1. Payment is due within ${dueInDays} days of invoice date.`,
      "2. Late payments will incur a 5% penalty fee.",
      "3. No refunds will be issued after the academic term begins.",
      "4. For any payment inquiries, please contact our billing department.",
    ];

    terms.forEach((term) => {
      doc.text(term, MARGIN + 5, y += 4.5);
    });

    resolve(Buffer.from(doc.output("arraybuffer")));
  });
}
