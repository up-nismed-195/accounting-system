import { jsPDF } from "jspdf";

export function generatePDF(voucherData) {
  const doc = new jsPDF();

  const {
    payee,
    address,
    dv_no = "SO-25-001",
    mode,
    charge,
    particulars,
    authorized_rep,
    approver,
    amount,
    apply_tax,
    tax_rate = 0  // Add tax_rate parameter
  } = voucherData;

  const totalAmount = parseFloat(amount);
  const taxRate = parseFloat(tax_rate) || 0;  // Use the passed tax rate
  const tax = totalAmount * (0.01 * taxRate);
  const netTotal = totalAmount - tax;

  const amountFormatted = `PHP ${totalAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  const taxFormatted = `PHP ${tax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  const totalFormatted = `PHP ${netTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, '-');

  function numberToWords(n) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
      "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const scales = ["", "Thousand", "Million", "Billion"];

    if (n === 0) return "Zero";

    let result = "";
    let group = 0;

    while (n > 0) {
      const chunk = n % 1000;
      if (chunk) {
        let str = "";
        const hundreds = Math.floor(chunk / 100);
        const tensUnits = chunk % 100;

        if (hundreds) str += ones[hundreds] + " Hundred ";
        if (tensUnits < 20) {
          str += ones[tensUnits];
        } else {
          str += tens[Math.floor(tensUnits / 10)] + " " + ones[tensUnits % 10];
        }
        result = str.trim() + " " + scales[group] + " " + result;
      }
      n = Math.floor(n / 1000);
      group++;
    }
    return result.trim();
  }

  const pesos = Math.floor(netTotal);
  const cents = Math.round((netTotal - pesos) * 100);
  let words = numberToWords(pesos) + " Pesos";
  if (cents > 0) {
    words += " and " + numberToWords(cents) + " Centavos";
  }

  doc.setFont("Times", "bold");
  doc.setFontSize(12);
  doc.text("Foundation for the Promotion of Science and Mathematics Education and Research, Inc.", 105, 20, { align: "center" });
  doc.text("DISBURSEMENT VOUCHER", 105, 28, { align: "center" });

  doc.rect(10, 10, 190, 240);

  doc.setFont("Times", "normal");
  doc.setFontSize(10);

  doc.rect(10, 35, 20, 8);
  doc.text("Payee:", 12, 41);
  doc.setFont("Times", "bold");
  doc.rect(30, 35, 105, 8);
  doc.text(payee, 32, 41);
  doc.setFont("Times", "normal");
  doc.rect(135, 35, 30, 8);
  doc.text("DV No.", 137, 41);
  doc.rect(165, 35, 35, 8);
  doc.text(dv_no, 167, 41);

  doc.rect(10, 43, 20, 8);
  doc.text("Address:", 12, 49);
  doc.rect(30, 43, 105, 8);
  doc.text(address, 32, 49);
  doc.rect(135, 43, 30, 8);
  doc.text("Date:", 137, 49);
  doc.rect(165, 43, 35, 8);
  doc.text(date, 167, 49);

  doc.rect(10, 51, 20, 8);
  doc.text("Charge vs:", 12, 57);
  doc.rect(30, 51, 170, 8);
  doc.setFont("Times", "bold");
  doc.text(charge, 32, 57);

  doc.setFont("Times", "normal");
  doc.rect(10, 59, 30, 8);
  doc.text("Mode of Payment:", 12, 65);
  doc.rect(40, 59, 160, 8);
  doc.text(mode, 42, 65);

  // Header for Particulars and Amount
  doc.setFont("Times", "bold");
  doc.rect(10, 67, 140, 8);
  doc.text("Particulars", 80, 73, { align: "center" });
  doc.rect(150, 67, 50, 8);
  doc.text("Amount", 175, 73, { align: "center" });

  // Singular particular with wrapping
  doc.setFont("Times", "normal");
  const lineHeight = 6;
  const baseY = 75;
  const wrappedParticular = doc.splitTextToSize(particulars.trim(), 138);
  const height = Math.max(wrappedParticular.length * lineHeight, 18);

  doc.rect(10, baseY, 140, height);
  doc.text(wrappedParticular, 12, baseY + 6);

  doc.rect(150, baseY, 50, height);
  doc.text(amountFormatted, 195, baseY + 6, { align: "right" });

  let currentY = baseY + height;

  // Tax and Total box (shared box under amount)
  const summaryHeight = (apply_tax && taxRate > 0) ? 24 : 12;
  doc.rect(150, currentY, 50, summaryHeight);

  if (apply_tax && taxRate > 0) {
    // Use dynamic tax rate text
    doc.text(`Less ${taxRate}% Tax`, 145, currentY + 8, { align: "right" });
    doc.text(taxFormatted, 195, currentY + 8, { align: "right" });
    doc.setFont("Times", "bold");
    doc.text("Total", 145, currentY + 18, { align: "right" });
    doc.text(totalFormatted, 195, currentY + 18, { align: "right" });
  } else {
    doc.setFont("Times", "bold");
    doc.text("Total", 145, currentY + 8, { align: "right" });
    doc.text(totalFormatted, 195, currentY + 8, { align: "right" });
  }

  const signatureY = currentY + summaryHeight;
  doc.setFont("Times", "bold");
  doc.rect(10, signatureY, 95, 50);
  doc.text("A", 12, signatureY + 8);
  doc.setFont("Times", "normal");
  doc.setFontSize(9);
  doc.text("Certified: Expenses/cash advance necessary,", 12, signatureY + 15);
  doc.text("lawful, and incurred under my direct supervision", 12, signatureY + 19);
  doc.setFont("Times", "bold");
  doc.setFontSize(10);
  doc.text(authorized_rep, 57.5, signatureY + 34, { align: "center" });
  doc.setFont("Times", "normal");
  doc.setFontSize(9);
  doc.line(20, signatureY + 36, 90, signatureY + 36);
  doc.text("Signature over Printed Name", 57.5, signatureY + 40, { align: "center" });
  doc.text("of Authorized Representative", 57.5, signatureY + 44, { align: "center" });
  doc.text(`Date: ${date}`, 57.5, signatureY + 48, { align: "center" });

  doc.setFont("Times", "bold");
  doc.rect(105, signatureY, 95, 50);
  doc.text("B", 107, signatureY + 8);
  doc.setFont("Times", "normal");
  doc.setFontSize(9);
  doc.text("Approved for payment by:", 107, signatureY + 15);
  doc.setFont("Times", "bold");
  doc.setFontSize(10);
  doc.text(approver, 152.5, signatureY + 34, { align: "center" });
  doc.setFont("Times", "normal");
  doc.setFontSize(9);
  doc.line(115, signatureY + 36, 185, signatureY + 36);
  doc.text("Signature over Printed Name", 152.5, signatureY + 40, { align: "center" });
  doc.text("Executive Director, FPSMER, Inc.", 152.5, signatureY + 44, { align: "center" });
  doc.text(`Date: ${date}`, 152.5, signatureY + 48, { align: "center" });

  const receiptY = signatureY + 55;
  doc.setFont("Times", "bold");
  doc.setFontSize(10);
  doc.text("C", 12, receiptY);
  doc.setFont("Times", "normal");
  doc.setFontSize(10);

  const receiptStart = "Received from the Foundation for the Promotion of Science and Mathematics Education and Research, Inc. the amount of ";
  const receiptLinesStart = doc.splitTextToSize(receiptStart, 185);
  const receiptLinesWords = doc.splitTextToSize(words, 185);

  doc.text(receiptLinesStart, 12, receiptY + 10);
  const lastLineY = receiptY + 10 + (receiptLinesStart.length - 1) * 6;
  doc.setFont("Times", "bold");
  doc.text(receiptLinesWords, 12, lastLineY + 6);

  doc.setFont("Times", "bold");
  doc.setFontSize(12);
  doc.text(totalFormatted, 152.5, receiptY + 28, { align: "center" });
  doc.text(payee, 152.5, receiptY + 58, { align: "center" });

  doc.setFont("Times", "normal");
  doc.setFontSize(8);
  doc.line(120, receiptY + 60, 185, receiptY + 60);
  doc.text("Signature over Printed Name", 152.5, receiptY + 64, { align: "center" });
  doc.text("of Payee", 152.5, receiptY + 68, { align: "center" });
  doc.text(`Date: ${date}`, 152.5, receiptY + 72, { align: "center" });

  doc.save(`voucher_${dv_no.replace("/", "-")}.pdf`);
}