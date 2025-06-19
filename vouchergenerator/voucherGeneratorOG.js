window.generateVoucher = function(event) {
  event.preventDefault();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const payee = document.getElementById('payee').value;
  const address = document.getElementById('address').value;
  const dv_no = document.getElementById('dv_no').value || "SO-25-001";
  const mode = document.getElementById('mode').value;
  const charge = document.getElementById('charge').value;
  const particulars = document.getElementById('particulars').value;
  const authorized_rep = document.getElementById('authorized_rep').value;
  const approver = document.getElementById('approver').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const apply_tax = document.getElementById('apply_tax').checked;
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-');

  const tax = apply_tax ? amount * 0.10 : 0;
  const total = amount - tax;
  const totalFormatted = `PHP ${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',')}`;
  const taxFormatted = `PHP ${tax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',')}`;
  const amountFormatted = `PHP ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',')}`;

  function numberToWords(n) {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
      "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const g = ["", "Thousand", "Million", "Billion"];

    if (n === 0) return "Zero";
    let result = "";
    let group = 0;
    while (n > 0) {
      const chunk = n % 1000;
      if (chunk) {
        let str = "";
        const hundreds = Math.floor(chunk / 100);
        const tensUnits = chunk % 100;
        if (hundreds) str += a[hundreds] + " Hundred ";
        if (tensUnits < 20) str += a[tensUnits];
        else str += b[Math.floor(tensUnits / 10)] + " " + a[tensUnits % 10];
        result = str.trim() + " " + g[group] + " " + result;
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

  doc.setFont("Times", "bold");
  doc.setFontSize(12);
  doc.text("Foundation for the Promotion of Science and Mathematics Education and Research, Inc.", 105, 20, { align: "center" });
  doc.text("DISBURSEMENT VOUCHER", 105, 28, { align: "center" });

  doc.rect(10, 10, 190, 240);

  doc.setFont("Times", "normal");
  doc.setFontSize(10);
  doc.rect(10, 35, 20, 8); doc.text("Payee:", 12, 41);
  doc.setFont("Times", "bold"); doc.rect(30, 35, 105, 8); doc.text(payee, 32, 41);
  doc.setFont("Times", "normal"); doc.rect(135, 35, 30, 8); doc.text("DV No.", 137, 41);
  doc.rect(165, 35, 35, 8); doc.text(dv_no, 167, 41);

  doc.rect(10, 43, 20, 8); doc.text("Address:", 12, 49);
  doc.rect(30, 43, 105, 8); doc.text(address, 32, 49);
  doc.rect(135, 43, 30, 8); doc.text("Date:", 137, 49);
  doc.rect(165, 43, 35, 8); doc.text(date, 167, 49);

  doc.rect(10, 51, 20, 8); doc.text("Charge vs:", 12, 57);
  doc.rect(30, 51, 170, 8); doc.setFont("Times", "bold"); doc.text(charge, 32, 57);

  doc.setFont("Times", "normal"); doc.rect(10, 59, 30, 8); doc.text("Mode of Payment:", 12, 65);
  doc.rect(40, 59, 160, 8); doc.text(mode, 42, 65);

  doc.setFont("Times", "bold");
  doc.rect(10, 67, 120, 8); doc.text("Particulars", 70, 73, { align: "center" });
  doc.rect(130, 67, 70, 8); doc.text("Amount", 165, 73, { align: "center" });

  doc.setFont("Times", "normal");
  doc.rect(10, 75, 120, 12); doc.text(particulars, 12, 83);
  doc.rect(130, 75, 70, 12); doc.text(amountFormatted, 195, 83, { align: "right" });

  let y = 87;
  if (apply_tax) {
    doc.rect(10, y, 120, 12); doc.text("Less 10% Tax", 125, y + 8, { align: "right" });
    doc.rect(130, y, 70, 12); doc.text(taxFormatted, 195, y + 8, { align: "right" });
    y += 12;
  }

  doc.setFont("Times", "bold");
  doc.rect(10, y, 120, 12); doc.text("Total", 125, y + 8, { align: "right" });
  doc.rect(130, y, 70, 12); doc.text(totalFormatted, 195, y + 8, { align: "right" });

  const sigY = y + 12;
  doc.setFont("Times", "bold"); doc.rect(10, sigY, 95, 50); doc.text("A", 12, sigY + 8);
  doc.setFont("Times", "normal"); doc.setFontSize(9);
  doc.text("Certified: Expenses/cash advance necessary,", 12, sigY + 15);
  doc.text("lawful, and incurred under my direct supervision", 12, sigY + 19);
  doc.setFont("Times", "bold"); doc.setFontSize(10);
  doc.text(authorized_rep, 57.5, sigY + 34, { align: "center" });
  doc.setFont("Times", "normal"); doc.setFontSize(9);
  doc.text("Signature over Printed Name", 57.5, sigY + 40, { align: "center" });
  doc.text("of Authorized Representative", 57.5, sigY + 44, { align: "center" });
  doc.text(`Date: ${date}`, 57.5, sigY + 48, { align: "center" });

  doc.setFont("Times", "bold"); doc.rect(105, sigY, 95, 50); doc.text("B", 107, sigY + 8);
  doc.setFont("Times", "normal"); doc.setFontSize(9); doc.text("Approved for payment by:", 107, sigY + 15);
  doc.setFont("Times", "bold"); doc.setFontSize(10);
  doc.text(approver, 152.5, sigY + 34, { align: "center" });
  doc.setFont("Times", "normal"); doc.setFontSize(9);
  doc.text("Signature over Printed Name", 152.5, sigY + 40, { align: "center" });
  doc.text("Executive Director, FPSMER, Inc.", 152.5, sigY + 44, { align: "center" });
  doc.text(`Date: ${date}`, 152.5, sigY + 48, { align: "center" });

  const rcptY = sigY + 55;
  doc.setFont("Times", "bold"); doc.setFontSize(10); doc.text("C", 12, rcptY);
  doc.setFont("Times", "normal"); doc.setFontSize(10);
  const receiptText = `Received from the Foundation for the Promotion of Science and Mathematics Education and Research, Inc. the amount of ${words}`;
  const receiptLines = doc.splitTextToSize(receiptText, 185);
  doc.text(receiptLines, 12, rcptY + 10);

  doc.setFont("Times", "bold"); doc.setFontSize(12);
  doc.text(totalFormatted, 152.5, rcptY + 28, { align: "center" });
  doc.text(payee, 152.5, rcptY + 58, { align: "center" });

  doc.setFont("Times", "normal"); doc.setFontSize(8);
  doc.text("Signature over Printed Name", 152.5, rcptY + 64, { align: "center" });
  doc.text("of Payee", 152.5, rcptY + 68, { align: "center" });
  doc.text(`Date: ${date}`, 152.5, rcptY + 72, { align: "center" });

  doc.save(`voucher_${dv_no.replace("/", "-")}.pdf`);
};
