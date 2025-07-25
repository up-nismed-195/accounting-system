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
      projectTaxValue: number  // Added tax value from project
    };
    approver: string
    authorized_rep: string
  }>();

  let project = $derived(commonInfo.project)
  let summaries = $derived(commonInfo.summaries)
  let selectedProject = $derived(commonInfo.selectedProject)
  let projectTaxValue = $derived(commonInfo.projectTaxValue)  // Get tax value from project

  import { padZeroes } from './helpers'
  let voucherIndex = $derived(summaries[project] + index + 1)
  let dv_no = $derived(`${project}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`)

  let openActionId = $state<string | null>(null);
  let menuPosition = $state({ x: 0, y: 0 });

  function toggleActions(id: string, event: MouseEvent) {
    if (openActionId === id) {
      openActionId = null;
    } else {
      const rect = (event.target as HTMLElement).closest('button')?.getBoundingClientRect();
      if (rect) {
        menuPosition = {
          x: rect.right - 200,
          y: rect.bottom + 5
        };
      }
      openActionId = id;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.action-menu') || 
        (event.target as HTMLElement).closest('.dropdown-item')) {
      openActionId = null;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  function deleteRow() {
    $rows = $rows.filter(r => r.id !== row.id);
    openActionId = null;
  }

  function updateValue(key: string, current: string, value: any) {
    $rows = $rows.map(r => {
      if (r.id === row.id) {
        if (key === "apply_tax") {
          // Now it's a boolean that determines if project tax is applied
          return { ...r, apply_tax: value };
        }
        return { ...r, [key]: value };
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
      // Use project tax value if apply_tax is true, otherwise 0
      tax: row.apply_tax ? projectTaxValue : 0,
      total: row.amount - (row.apply_tax ? (0.01 * projectTaxValue * row.amount) : 0),
      authorized_rep: authorized_rep,
      approver: approver,
      date: new Date().toISOString(),
    }
  }

  function downloadAsCSV() {
    const taxAmount = row.apply_tax ? projectTaxValue : 0;
    const totalAmount = row.amount - (row.apply_tax ? (0.01 * projectTaxValue * row.amount) : 0);
    
    const csvData = [
      ['DV Number', 'Name', 'Address', 'Particulars', 'Mode', 'Remarks', 'Amount', 'Tax (%)', 'Total', 'Project', 'Authorized Rep', 'Approver', 'Date'],
      [
        dv_no,
        row.name,
        row.address,
        row.particulars,
        row.mode,
        row.remarks,
        row.amount,
        taxAmount,
        totalAmount,
        selectedProject,
        authorized_rep,
        approver,
        new Date().toLocaleDateString()
      ]
    ];

    const csvContent = csvData.map(row => 
      row.map(field => {
        const stringField = String(field || '');
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `voucher_${dv_no}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      dv_no: ''
    };
    $rows = [...$rows, newRow];
    openActionId = null;
  }
</script>

<tr class="bg-white border-b border-gray-200 hover:bg-gray-50">
  <!-- DV Number -->
  <td class="px-3 py-3 w-[12%] min-w-[120px]">
    <div class="truncate">{dv_no}</div>
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
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
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
      <button onclick={() => { downloadAsCSV(); }} class="dropdown-item block px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left">Download as CSV</button>
      <button onclick={() => { duplicateRow(); }} class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Duplicate</button>
      <button onclick={() => { deleteRow(); }} class="dropdown-item block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">Delete</button>
      <!-- Removed "Save to database" button -->
    </div>
  </div>
{/if}

<style>
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
</style>