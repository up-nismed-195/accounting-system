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
        const dropdownHeight = 200; 
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
    // Validate DV number format (optional but recommended)
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