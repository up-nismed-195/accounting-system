<script lang="ts">
  import { onMount } from 'svelte';
  import { rows } from './data.svelte.js';

  // Destructure props
  let { row, index, commonInfo } = $props<{
    row: VoucherEntry;
    index: number;
    commonInfo: {
      project: string,
      authorizedRep: string,
      approver: string,
      summaries: Record<string, number>,
      selectedProject: string
    };
  }>();

  // Derived values
  let project = $derived(commonInfo.project)
  let authorizedRep = $derived(commonInfo.authorizedRep)
  let approver = $derived(commonInfo.approver)
  let summaries = $derived(commonInfo.summaries)

  $effect(() => { console.log(summaries)})
  let selectedProject = $derived(commonInfo.selectedProject)

  import { padZeroes } from './helpers'
  let voucherIndex = $derived(summaries[project] + index + 1)
  let dv_no = $derived(`${project}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`)

  // Action menu state - Use $state for proper reactivity
  let openActionId = $state<string | null>(null);
  let menuPosition = $state({ x: 0, y: 0 });
  
  function toggleActions(id: string, event: MouseEvent) {
    console.log('Toggling actions for ID:', id);
    
    // Always close any open menu first
    if (openActionId === id) {
      // If clicking the same button, just close it
      openActionId = null;
    } else {
      // Close any other open menu and open this one
      const rect = (event.target as HTMLElement).closest('button')?.getBoundingClientRect();
      if (rect) {
        menuPosition = {
          x: rect.right - 200, // Position from right edge, adjust as needed
          y: rect.bottom + 5   // Position below the button
        };
      }
      openActionId = id; // This will close any other open menu automatically
    }
    console.log('openActionId is now:', openActionId);
  }

  // Close menu when clicking outside or on any action
  function handleClickOutside(event: MouseEvent) {
    // Close menu if clicking outside the action menu or on any menu item
    if (!(event.target as HTMLElement).closest('.action-menu') || 
        (event.target as HTMLElement).closest('.dropdown-item')) {
      openActionId = null;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  // Row operations
  function deleteRow() {
    $rows = $rows.filter(r => r.id !== row.id);
    openActionId = null;
  }

  function updateValue(key: string, current: string, value: any) {
    $rows = $rows.map(r => {
      if (r.id === row.id) {
        if (key === "tax") {
          return { ...r, tax: value ? 10 : 0 };
        }
        return { ...r, [key]: value };
      }
      return r;
    });
  }

  // Generate Voucher
  import { generateVoucher } from './helpers.js';
  import { supabase } from '$lib/supabaseClient.js';

  function rowToPDF(row: VoucherEntry): VoucherPDF {
    // alert(JSON.stringify(commonInfo))
    return {
      name: row.name,
      address: row.address,
      particulars: row.particulars,
      dv_no: dv_no,
      project_name: selectedProject,
      project_name: commonInfo.project,
      mode: row.mode,
      remarks: row.remarks,
      amount: row.amount,
      tax: row.tax,
      total: row.amount - (0.01 * row.tax * row.amount),
      authorized_rep: authorizedRep,
      approver: approver,
      date: new Date().toISOString(),
    }
  }

  async function saveToDatabase() {
    const { data, error } = await supabase
      .from("payee")
      .upsert({name: row.name, address: row.address})
      .select()

    const { data: data2, error: error2 } = await supabase
      .from("voucher")
      .upsert({
        dv_no: dv_no,
        payee_name: row.name,
        project_code: project,
        payment_mode: row.mode,
        voucher_date: new Date().toISOString(),
        amount: row.amount,
        authorized_representative: authorizedRep,
        approver: approver
      })
      .select()

    if (data && data2) {
      alert("Saved successfully");
    } else {
      alert("Error saving data");
    }

    await loadProjects();
    openActionId = null;
  }

  import { projectsLoading } from '$lib/stores/stores.js';

  async function loadProjects() {
    $projectsLoading = true;
    const { data } = await supabase
      .from("project_summaries")
      .select();

    summaries = Object.fromEntries(
      (data ?? []).map(item => [item.code, item.total_vouchers])
    );
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
  <td class="px-3 py-3 w-[25%] min-w-[200px]">
    <input 
      type="text" 
      oninput={e => updateValue("address", row.address, e.target.value)}
      value={row.address}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Address..."
    >
  </td>
  
  <!-- Particulars -->
  <td class="px-3 py-3 w-[15%] min-w-[150px]">
    <input 
      type="text" 
      oninput={e => updateValue("particulars", row.particulars, e.target.value)}
      value={row.particulars}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Particulars..."
    >
  </td>
  
  <!-- Mode -->
  <td class="px-3 py-3 w-[10%] min-w-[100px]">
    <input 
      type="text" 
      oninput={e => updateValue("mode", row.mode, e.target.value)}
      value={row.mode}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Mode..."
    >
      <option value="Cash" selected>Cash</option>
      <option value="GCash">GCash</option>
    </select>
  </td>
  
  <!-- Remarks -->
  <td class="px-3 py-3 w-[15%] min-w-[150px]">
    <input 
      type="text" 
      oninput={e => updateValue("remarks", row.remarks, e.target.value)}
      value={row.remarks}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Remarks..."
    >
  </td>
  
  <!-- Amount -->
  <td class="px-3 py-3 w-[10%] min-w-[100px]">
    <input 
      type="number" 
      oninput={e => updateValue("amount", row.amount, e.target.value)}
      value={row.amount}
      class="w-full px-2 py-1 border border-transparent hover:border-blue-300 rounded"
      placeholder="Amount"  
    >
  </td>
  
  <!-- Tax -->
  <td class="px-3 py-3 w-[8%] min-w-[80px] text-center">
    <input 
      type="checkbox"
      checked={row.tax === 10}
      onchange={e => updateValue("tax", row.tax, e.target.checked)}
      class="w-5 h-5 align-middle"
      title="Apply 10% tax"
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
      <!-- Pencil Edit Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    </button>
  </td>
</tr>

<!-- Action Menu Dropdown - Positioned using portal-like approach -->
{#if openActionId === row.id}
  <div 
    class="fixed z-[9999] w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border"
    style="top: {menuPosition.y}px; left: {menuPosition.x}px;"
  >
    <div class="py-1">
      <button
        onclick={(e) => {
          e.stopPropagation();
          generateVoucher(rowToPDF(row));
          openActionId = null;
        }}
        class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
      >
        Save as PDF
      </button>
      <button
        onclick={(e) => {
          e.stopPropagation();
          duplicateRow();
        }}
        class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
      >
        Duplicate
      </button>
      <button
        onclick={(e) => {
          e.stopPropagation();
          deleteRow();
        }}
        class="dropdown-item block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
      >
        Delete
      </button>
      <button
        onclick={(e) => {
          e.stopPropagation();
          saveToDatabase();
        }}
        class="dropdown-item block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left transition-colors"
      >
        Edit
      </button>
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

  /* Override overflow for action column */
  .action-menu {
    overflow: visible !important;
  }

  input {
    width: 100%;
    font-size: 13px;
    background: transparent;
    outline: none;
  }

  input[type="text"], 
  input[type="number"] {
    padding: 4px 8px;
  }

  input:hover {
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