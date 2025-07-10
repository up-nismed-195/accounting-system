<script lang="ts">
  import { onMount } from 'svelte';
  import { rows } from './data.svelte.js';

  let { row, index, commonInfo, approver, authorized_rep } = $props<{
    row: VoucherEntry;
    index: number;
    commonInfo: {
      project: string,
      summaries: Record<string, number>,
      selectedProject: string,
      projectTaxValue: number
    };
    approver: string
    authorized_rep: string
  }>();

  let project = $derived(commonInfo.project)
  let summaries = $derived(commonInfo.summaries)
  let selectedProject = $derived(commonInfo.selectedProject)
  let projectTaxValue = $derived(commonInfo.projectTaxValue)

  import { padZeroes } from './helpers'
  
  // Use existing dv_no if it exists, otherwise generate new one
  let dv_no = $derived(row.dv_no || `${project}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, summaries[project] + index + 1)}`)

  let openActionId = $state<string | null>(null);
  let menuPosition = $state({ x: 0, y: 0 });

  function toggleActions(id: string, event: MouseEvent) {
    if (openActionId === id) {
      openActionId = null;
    } else {
      const rect = (event.target as HTMLElement).closest('button')?.getBoundingClientRect();
      if (rect) {
        const dropdownHeight = 240; // Increased height for new print button
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          menuPosition = {
            x: rect.right - 200,
            y: rect.top - dropdownHeight - 5 
          };
        } else {
          menuPosition = {
            x: rect.right - 200,
            y: rect.bottom + 5
          };
        }
      }
      openActionId = id;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.action-menu') && 
        !(event.target as HTMLElement).closest('.dropdown-item')) {
      openActionId = null;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  function deleteRow() {
    if (confirm("Are you sure you want to delete this voucher?")) {
      $rows = $rows.filter(r => r.id !== row.id);
      openActionId = null;
    }
  }

  function updateValue(key: string, current: string, value: any) {
    $rows = $rows.map(r => {
      if (r.id === row.id) {
        if (key === "apply_tax") {
          return { ...r, apply_tax: value };
        }
        return { ...r, [key]: value };
      }
      return r;
    });
  }

  // Function to check if DV number already exists
  async function checkDVNumberExists(dvNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("voucher")
        .select("dv_no")
        .eq("dv_no", dvNumber)
        .eq("project_code", selectedProject);
      
      if (error) {
        console.error("Error checking DV number:", error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking DV number:", error);
      return false;
    }
  }

  // Function to handle DV number changes
  async function updateDVNumber(newDVNumber: string) {
    const dvPattern = /^[A-Z]+-\d{2}-\d{3}$/;
    if (!dvPattern.test(newDVNumber)) {
      alert("Invalid DV number format. Use format: PROJECT-YY-###");
      return;
    }
    
    // Check if DV number already exists for this project
    const exists = await checkDVNumberExists(newDVNumber);
    if (exists && newDVNumber !== row.dv_no) {
      alert("This DV number already exists for this project.");
      return;
    }
    
    // Update the row with the new DV number
    $rows = $rows.map(r => {
      if (r.id === row.id) {
        return { ...r, dv_no: newDVNumber };
      }
      return r;
    });
  }

  import { generateVoucher } from './helpers.js';
  import { supabase } from '$lib/supabaseClient.js';

  function rowToPDF(row: VoucherEntry): VoucherPDF {
    return {
      name: row.name,
      address: row.address,
      particulars: row.particulars,
      dv_no: dv_no,
      project_name: selectedProject,
      mode: row.mode,
      remarks: row.remarks,
      amount: row.amount,
      apply_tax: row.apply_tax,
      tax_rate: projectTaxValue,
      authorized_rep: authorized_rep,
      approver: approver,
      date: new Date().toISOString(),
    }
  }

  // Print function using the same format as PDF generator
  async function printVoucher() {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      const voucherData = {
        payee: row.name,
        address: row.address,
        dv_no: dv_no,
        mode: row.mode,
        charge: selectedProject,
        particulars: row.particulars,
        authorized_rep: authorized_rep,
        approver: approver,
        amount: row.amount,
        apply_tax: row.apply_tax,
        tax_rate: projectTaxValue
      };

      const totalAmount = parseFloat(voucherData.amount);
      const taxRate = parseFloat(voucherData.tax_rate) || 0;
      const tax = totalAmount * (0.01 * taxRate);
      const netTotal = voucherData.apply_tax ? totalAmount - tax : totalAmount;

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
      doc.text(voucherData.payee, 32, 41);
      doc.setFont("Times", "normal");
      doc.rect(135, 35, 30, 8);
      doc.text("DV No.", 137, 41);
      doc.rect(165, 35, 35, 8);
      doc.text(voucherData.dv_no, 167, 41);

      doc.rect(10, 43, 20, 8);
      doc.text("Address:", 12, 49);
      doc.rect(30, 43, 105, 8);
      doc.text(voucherData.address, 32, 49);
      doc.rect(135, 43, 30, 8);
      doc.text("Date:", 137, 49);
      doc.rect(165, 43, 35, 8);
      doc.text(date, 167, 49);

      doc.rect(10, 51, 20, 8);
      doc.text("Charge vs:", 12, 57);
      doc.rect(30, 51, 170, 8);
      doc.setFont("Times", "bold");
      doc.text(voucherData.charge, 32, 57);

      doc.setFont("Times", "normal");
      doc.rect(10, 59, 30, 8);
      doc.text("Mode of Payment:", 12, 65);
      doc.rect(40, 59, 160, 8);
      doc.text(voucherData.mode, 42, 65);

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
      const wrappedParticular = doc.splitTextToSize(voucherData.particulars.trim(), 138);
      const height = Math.max(wrappedParticular.length * lineHeight, 18);

      doc.rect(10, baseY, 140, height);
      doc.text(wrappedParticular, 12, baseY + 6);

      doc.rect(150, baseY, 50, height);
      doc.text(amountFormatted, 195, baseY + 6, { align: "right" });

      let currentY = baseY + height;

      // Tax and Total box (shared box under amount)
      const summaryHeight = (voucherData.apply_tax && taxRate > 0) ? 24 : 12;
      doc.rect(150, currentY, 50, summaryHeight);

      if (voucherData.apply_tax && taxRate > 0) {
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
      doc.text(voucherData.authorized_rep, 57.5, signatureY + 34, { align: "center" });
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
      doc.text(voucherData.approver, 152.5, signatureY + 34, { align: "center" });
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
      doc.text(voucherData.payee, 152.5, receiptY + 58, { align: "center" });

      doc.setFont("Times", "normal");
      doc.setFontSize(8);
      doc.line(120, receiptY + 60, 185, receiptY + 60);
      doc.text("Signature over Printed Name", 152.5, receiptY + 64, { align: "center" });
      doc.text("of Payee", 152.5, receiptY + 68, { align: "center" });
      doc.text(`Date: ${date}`, 152.5, receiptY + 72, { align: "center" });

      // Open PDF in new window for printing
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          // Clean up the URL after printing
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 1000);
        };
      }
      
      openActionId = null;
    } catch (error) {
      console.error('Error printing voucher:', error);
      alert('Error printing voucher. Please try again.');
    }
  }

  async function saveToDatabase() {
    try {
      // Save payee first
      const { data: payeeData, error: payeeError } = await supabase
        .from("payee")
        .upsert({name: row.name, address: row.address})
        .select()

      if (payeeError) {
        console.error('Error saving payee:', payeeError);
        alert('Error saving payee to database');
        return;
      }

      // Save or update voucher
      const { data: voucherData, error: voucherError } = await supabase
        .from("voucher")
        .upsert({
          dv_no: dv_no,
          payee_name: row.name,
          project_code: selectedProject,
          payment_mode: row.mode,
          voucher_date: new Date().toISOString(),
          amount: parseFloat(row.amount) || 0,
          apply_tax: row.apply_tax,
          authorized_representative: authorized_rep,
          approver: approver,
          particulars: row.particulars,
          remarks: row.remarks
        })
        .select()

      if (voucherError) {
        console.error('Error saving voucher:', voucherError);
        alert('Error saving voucher to database');
        return;
      }

      // Update the row with the saved dv_no to prevent regeneration
      $rows = $rows.map(r => {
        if (r.id === row.id) {
          return { ...r, dv_no: dv_no };
        }
        return r;
      });

      console.log('Voucher saved successfully:', voucherData);
      alert('Voucher saved to database successfully!');
      
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert('Error saving voucher to database');
    }
    
    openActionId = null;
  }
  

  async function deleteFromDatabase() {
    if (!confirm("Are you sure you want to delete this voucher from the database? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("voucher")
        .delete()
        .eq("dv_no", dv_no);

      if (error) {
        console.error('Error deleting voucher:', error);
        alert('Error deleting voucher from database');
        return;
      }

      $rows = $rows.filter(r => r.id !== row.id);
      alert('Voucher deleted from database successfully!');
      
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Error deleting voucher from database');
    }
    
    openActionId = null;
  }

  import { projectsLoading } from '$lib/stores/stores.js';

  async function loadProjects() {
    $projectsLoading = true;
    const { data } = await supabase.from("project_summaries").select();
    summaries = Object.fromEntries((data ?? []).map(item => [item.code, item.total_vouchers]));
    $projectsLoading = false;
  }

  function duplicateRow() {
    const newRow = {
      ...row,
      id: crypto.randomUUID(),
      dv_no: '' // Clear dv_no so it gets regenerated
    };
    $rows = [...$rows, newRow];
    openActionId = null;
  }
</script>

<tr class="bg-white border-b border-gray-200 hover:bg-gray-50">
  <!-- DV Number -->
  <td class="px-3 py-3 w-[12%] min-w-[120px]">
    <input 
      type="text" 
      oninput={e => updateDVNumber(e.target.value)}
      value={dv_no}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="DV Number..."
    >
  </td>

  <!-- Name -->
  <td class="px-3 py-3 w-[15%] min-w-[150px]">
    <input 
      type="text" 
      oninput={e => updateValue("name", row.name, e.target.value)}
      value={row.name}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Name..."
    >
  </td>

  <!-- Address -->
  <td class="px-3 py-3 w-[23%] min-w-[180px]">
    <input 
      type="text" 
      oninput={e => updateValue("address", row.address, e.target.value)}
      value={row.address}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Address..."
    >
  </td>

  <!-- Particulars (textarea) -->
  <td class="px-3 py-3 w-[18%] min-w-[180px]">
    <textarea
      rows="3"
      oninput={e => updateValue("particulars", row.particulars, e.target.value)}
      bind:value={row.particulars}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded resize-y leading-snug text-sm"
      placeholder="Particulars..."
    ></textarea>
  </td>

  <!-- Mode (smaller) -->
  <td class="px-3 py-3 w-[8%] min-w-[80px]">
    <select
      onchange={e => updateValue("mode", row.mode, e.target.value)}
      value={row.mode}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded bg-white text-xs"
    >
      <option value="Cash">Cash</option>
      <option value="GCash">GCash</option>
      <option value="Check">Check</option>
      <option value="Bank Transfer">Bank Transfer</option>
    </select>
  </td>

  <!-- Remarks -->
  <td class="px-3 py-3 w-[12%] min-w-[120px]">
    <input 
      type="text" 
      oninput={e => updateValue("remarks", row.remarks, e.target.value)}
      value={row.remarks}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Remarks..."
    >
  </td>

  <!-- Amount (bigger) -->
  <td class="px-3 py-3 w-[12%] min-w-[120px]">
    <input 
      type="number" 
      oninput={e => updateValue("amount", row.amount, e.target.value)}
      value={row.amount}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Amount"  
    >
  </td>

  <!-- Tax (now boolean for applying project tax) -->
  <td class="px-3 py-3 w-[8%] min-w-[80px] text-center">
    <input 
      type="checkbox"
      checked={row.apply_tax}
      onchange={e => updateValue("apply_tax", row.apply_tax, e.target.checked)}
      class="w-5 h-5 align-middle"
      title={`Apply ${projectTaxValue}% tax`}
    >
  </td>

  <!-- Actions -->
  <td class="px-3 py-3 w-[10%] min-w-[100px] text-center action-menu" style="position: relative; overflow: visible;">
    <button
      type="button"
      class="p-2 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
      onclick={(e) => {
        e.stopPropagation();
        toggleActions(row.id, e);
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </button>
  </td>
</tr>

{#if openActionId === row.id}
  <div 
    class="fixed z-[9999] w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border"
    style="top: {menuPosition.y}px; left: {menuPosition.x}px;"
  >
    <div class="py-1">
      <button onclick={() => { generateVoucher(rowToPDF(row)); openActionId = null; }} class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Download as PDF</button>
      <button onclick={() => { printVoucher(); }} class="dropdown-item block px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left">Print Voucher</button>
      <button onclick={() => { saveToDatabase(); }} class="dropdown-item block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left">Save to Database</button>
      <button onclick={() => { duplicateRow(); }} class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Duplicate</button>
      <hr class="border-gray-200 my-1">
      {#if row.dv_no}
        <button onclick={() => { deleteFromDatabase(); }} class="dropdown-item block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">Delete</button>
      {/if}
    </div>
  </div>
{/if}

<style lang="postcss">
  table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }

  td {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid #e5e7eb;
    vertical-align: middle;
  }

  .action-menu {
    overflow: visible !important;
  }

  input, select, textarea {
    width: 100%;
    font-size: 13px;
    background: transparent;
    outline: none;
  }

  input[type="text"], 
  input[type="number"],
  select,
  textarea {
    padding: 4px 8px;
  }

  input:hover, select:hover, textarea:hover {
    background: #f8fafc;
  }

  .action-menu button svg {
    transition: all 0.2s;
  }

  .action-menu button:hover svg {
    transform: scale(1.1);
    color: #3b82f6;
  }

  ::placeholder {
    color: #9ca3af;
    font-style: italic;
    opacity: 0.7;
  }

  .dropdown-item {
    transition: all 0.2s;
  }

  .dropdown-item:hover {
    background-color: #f3f4f6;
  }
</style>