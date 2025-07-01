import { jsPDF } from "jspdf";

/**
 * Generates a disbursement voucher PDF
 * @param {Object} voucherData - The voucher data object
 * @param {string} voucherData.name - Name of the payee
 * @param {string} voucherData.address - Address of the payee
 * @param {string} [voucherData.dv_no="SO-25-001"] - Disbursement voucher number
 * @param {string} voucherData.mode - Mode of payment
 * @param {string} voucherData.particulars - Description of the expense
 * @param {string} voucherData.authorized_rep - Name of authorized representative
 * @param {string} voucherData.approver - Name of the approver
 * @param {number} voucherData.amount - Amount before tax
 * @param {number} [voucherData.apply_tax=0] - Whether to apply tax (0 or 10)
 * @param {number} [voucherData.tax=10] - Tax percentage
 * @param {string} voucherData.project_name - Project name for charge
 */
export function generateVoucher(voucherData) {
  const doc = new jsPDF();

  const {
    name: payee,
    address,
    dv_no = "SO-25-001",
    mode,
    particulars,
    authorized_rep,
    approver,
    amount,
    apply_tax = 0,
    tax = 10,
    project_name
  } = voucherData;

  const shouldApplyTax = apply_tax === 10 || apply_tax === 1;
  const taxAmount = shouldApplyTax ? amount * (tax * 0.01) : 0;
  const total = amount - taxAmount;

  const formatCurrency = (value) =>
    `PHP ${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalFormatted = formatCurrency(total);
  const taxFormatted = formatCurrency(taxAmount);
  const amountFormatted = formatCurrency(amount);

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-');

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

  const pesos = Math.floor(total);
  const cents = Math.round((total - pesos) * 100);
  let words = numberToWords(pesos) + " Pesos";
  if (cents > 0) words += " and " + numberToWords(cents) + " Centavos";

  function drawUnderlinedText(text, x, y, align = 'left') {
    const textWidth = doc.getTextWidth(text);
    let adjustedX = x;

    if (align === 'center') {
      adjustedX = x - (textWidth / 2);
    } else if (align === 'right') {
      adjustedX = x - textWidth;
    }

    doc.text(text, x, y, { align });
    doc.line(adjustedX, y + 1, adjustedX + textWidth, y + 1);
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
  doc.text(project_name || "Project", 32, 57);

  doc.setFont("Times", "normal");
  doc.rect(10, 59, 30, 8);
  doc.text("Mode of Payment:", 12, 65);
  doc.rect(40, 59, 160, 8);
  doc.text(mode, 42, 65);

  doc.setFont("Times", "bold");
  doc.rect(10, 67, 120, 8);
  doc.text("Particulars", 70, 73, { align: "center" });
  doc.rect(130, 67, 70, 8);
  doc.text("Amount", 165, 73, { align: "center" });

  doc.setFont("Times", "normal");
  doc.rect(10, 75, 120, 12);
  doc.text(particulars, 12, 83);
  doc.rect(130, 75, 70, 12);
  doc.text(amountFormatted, 195, 83, { align: "right" });

  let currentY = 87;

  if (shouldApplyTax && taxAmount > 0) {
    doc.rect(10, currentY, 120, 12);
    doc.text(`Less ${tax}% Tax`, 125, currentY + 8, { align: "right" });
    doc.rect(130, currentY, 70, 12);
    doc.text(taxFormatted, 195, currentY + 8, { align: "right" });
    currentY += 12;
  }

  doc.setFont("Times", "bold");
  doc.rect(10, currentY, 120, 12);
  doc.text("Total", 125, currentY + 8, { align: "right" });
  doc.rect(130, currentY, 70, 12);
  doc.text(totalFormatted, 195, currentY + 8, { align: "right" });

  const signatureY = currentY + 12;

  // Section A - Authorized Representative
  doc.setFont("Times", "bold");
  doc.rect(10, signatureY, 95, 50);
  doc.text("A", 12, signatureY + 8);
  doc.setFont("Times", "normal");
  doc.setFontSize(9);
  doc.text("Certified: Expenses/cash advance necessary,", 12, signatureY + 15);
  doc.text("lawful, and incurred under my direct supervision", 12, signatureY + 19);

  doc.setFont("Times", "bold");
  doc.setFontSize(10);
  drawUnderlinedText(authorized_rep, 57.5, signatureY + 34, 'center');

  doc.setFont("Times", "normal");
  doc.setFontSize(9);
  doc.text("Signature over Printed Name", 57.5, signatureY + 40, { align: "center" });
  doc.text("of Authorized Representative", 57.5, signatureY + 44, { align: "center" });
  doc.text(`Date: ${date}`, 57.5, signatureY + 48, { align: "center" });

  // Section B - Approver
  doc.setFont("Times", "bold");
  doc.rect(105, signatureY, 95, 50);
  doc.text("B", 107, signatureY + 8);
  doc.setFont("Times", "normal");
  doc.setFontSize(9);
  doc.text("Approved for payment by:", 107, signatureY + 15);

  doc.setFont("Times", "bold");
  doc.setFontSize(10);
  drawUnderlinedText(approver, 152.5, signatureY + 34, 'center');

  doc.setFont("Times", "normal");
  doc.setFontSize(9);
  doc.text("Signature over Printed Name", 152.5, signatureY + 40, { align: "center" });
  doc.text("Executive Director, FPSMER, Inc.", 152.5, signatureY + 44, { align: "center" });
  doc.text(`Date: ${date}`, 152.5, signatureY + 48, { align: "center" });

  const receiptY = signatureY + 55;
  doc.setFont("Times", "bold");
  doc.setFontSize(10);
  doc.text("C", 12, receiptY);
  doc.setFont("Times", "normal");
  doc.setFontSize(10);

  const receiptText = `Received from the Foundation for the Promotion of Science and Mathematics Education and Research, Inc. the amount of ${words}`;
  const receiptLines = doc.splitTextToSize(receiptText, 185);
  doc.text(receiptLines, 12, receiptY + 10);

  doc.setFont("Times", "bold");
  doc.setFontSize(12);
  doc.text(totalFormatted, 152.5, receiptY + 28, { align: "center" });

  drawUnderlinedText(payee, 152.5, receiptY + 58, 'center');

  doc.setFont("Times", "normal");
  doc.setFontSize(8);
  doc.text("Signature over Printed Name", 152.5, receiptY + 64, { align: "center" });
  doc.text("of Payee", 152.5, receiptY + 68, { align: "center" });
  doc.text(`Date: ${date}`, 152.5, receiptY + 72, { align: "center" });

  doc.save(`voucher_${dv_no.replace("/", "-")}.pdf`);
}
