  <script lang="ts">
    import { onMount } from 'svelte';
    import { rows } from './data.svelte.js';

    // ===================
    // destructuring props
    // ==================
    
    let { row, index, commonInfo, isSelected, onSelectionChange } = $props<{
      row: VoucherEntry;
      index: number;
      commonInfo: {
        project: string,
        authorizedRep: string,
        approver: string,
        summaries: Record<string, number>,
      };
      isSelected: boolean;
      onSelectionChange: (id: string, selected: boolean) => void;
    }>();

    let project = $derived(commonInfo.project)
    let authorizedRep = $derived(commonInfo.authorizedRep)
    let approver = $derived(commonInfo.approver)
    let summaries = $derived(commonInfo.summaries)

    import { padZeroes } from './helpers'

    let voucherIndex = $derived(summaries[project] + index + 1)
    let dv_no = $derived(`${project}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`)

    // ==============
    // row operations
    // ==============

    const keys = Object.keys(row)
    let showDropdown = $state(false)
    let dropdownRef: HTMLDivElement | null = null

    function deleteRow() {
      $rows = $rows.filter(r => r.id !== row.id);
    }

    function duplicateRow() {
      const newRow = { ...row, id: crypto.randomUUID() };
      const currentIndex = $rows.findIndex(r => r.id === row.id);
      $rows = [
        ...$rows.slice(0, currentIndex + 1),
        newRow,
        ...$rows.slice(currentIndex + 1)
      ];
    }

    function updateValue(key: string, current: string, value: any) {
      $rows = $rows.map(r => {
        if (r.id === row.id) {
          console.log("key", key)
          return { 
            name: key == "name" ? value : r.name,
            address: key == "address" ? value : r.address,
            id: key == "id" ? value : r.id,
            dv_no: key == "dv_no" ? value : r.dv_no,
            particulars: key == "particulars" ? value : r.particulars,
            mode: key == "mode" ? value : r.mode,
            remarks: key == "remarks" ? value : r.remarks,
            amount: key == "amount" ? value : r.amount,
            tax: key == "tax" ? value : r.tax,
            apply_tax: key == "apply_tax" ? value : r.apply_tax,
          };
        } else {
          return r;
        }
      });
    }

    // ================
    // Generate Voucher
    // ================ 

    import { generateVoucher } from './helpers.js';
    import { supabase } from '$lib/supabaseClient.js';

    function rowToPDF(row: VoucherEntry): VoucherPDF {
      return {
        name: row.name,
        address: row.address,
        particulars: row.particulars,
        dv_no: dv_no,
        project_name: project,
        mode: row.mode,
        remarks: row.remarks,
        amount: row.amount,
        tax: row.tax,
        apply_tax: row.apply_tax,
        total: row.amount - (row.apply_tax === 10 ? 0.01 * row.tax * row.amount : 0),
        authorized_rep: authorizedRep,
        approver: approver,
        date: Date.now().toString(),
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
          voucher_date: (new Date()).toISOString(),
          amount: row.amount,
          authorized_representative: authorizedRep,
          approver: approver
        })
        .select()

      if (data && data2) {
        alert("success")
      } else {
        alert("failure")
      }

      await loadProjects()
    }

    import { projectsLoading } from '$lib/stores/stores.js';

    async function loadProjects() {
      $projectsLoading = true
      const { data } = await supabase
          .from("project_summaries")
          .select();

      summaries = Object.fromEntries(
        (data ?? []).map(item => [item.code, item.total_vouchers])
      )

      $projectsLoading = false
    }
  
    $effect(() => {
      console.log($rows);
    })

    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (showDropdown && dropdownRef && !dropdownRef.contains(event.target as Node)) {
        showDropdown = false;
      }
    }

    onMount(() => {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    })
  </script>

  <tr class="bg-white border-b border-gray-200 hover:bg-gray-50"> 
    <td class="px-3 py-3 w-[50px]">
      <input 
        type="checkbox" 
        checked={isSelected}
        onchange={(e) => onSelectionChange(row.id, (e.target as HTMLInputElement).checked)}
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      >
    </td>
    <td class="px-3 py-3 break-text break-all w-[140px]">
      {dv_no}
    </td>
    <td class="px-3 py-3 break-text break-all w-[200px]">
      <input type="text" 
        oninput={e => updateValue("name", row.name, (e.target as HTMLInputElement).value)}
        value={row.name}
        class="w-full border-0 bg-transparent focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600 border-b border-gray-300"
        placeholder="Juan dela Cruz..."
      >
    </td>
    <td class="px-3 py-1 break-text break-all w-[350px]">
      <input type="text" 
        oninput={e => updateValue("address", row.address, (e.target as HTMLInputElement).value)}
        value={row.address}
        class="w-full border-0 bg-transparent focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600 border-b border-gray-300"
        placeholder="Pardo de Tavera St, Diliman, Quezon City..."
      >
    </td>
    <td class="px-3 py-3 break-text break-all w-[180px]">
      <input type="text" 
        oninput={e => updateValue("particulars", row.particulars, (e.target as HTMLInputElement).value)}
        placeholder="Charged to 250k..."
        value={row.particulars}
        class="w-full border-0 bg-transparent focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600 border-b border-gray-300"
      >
    </td>
    <td class="px-3 py-3 break-text break-all w-[120px]">
      <select
        class="w-full bg-transparent border-0 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600 border-b border-gray-300 text-sm"
        value={row.mode}
        onchange={(e) => updateValue("mode", row.mode, (e.target as HTMLSelectElement).value)}
      >
        <option value="">Select mode</option>
        <option value="Cash">Cash</option>
        <option value="Check">Check</option>
        <option value="Bank Transfer">Bank Transfer</option>
        <option value="GCash">GCash</option>
        <option value="Others">Others</option>
      </select>
    </td>
    <td class="px-3 py-3 break-text break-all w-[180px]">
      <input type="text" 
        oninput={e => updateValue("remarks", row.remarks, (e.target as HTMLInputElement).value)}
        value={row.remarks}
        class="w-full border-0 bg-transparent focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600 border-b border-gray-300"
        placeholder="Paid on time..."
      >
    </td>
    <td class="px-3 py-3 break-text break-all w-[120px]">
      <input type="number" 
        oninput={e => updateValue("amount", row.amount, (e.target as HTMLInputElement).value)}
        value={row.amount}
        class="w-full border-0 bg-transparent focus:outline-none focus:ring-0 focus:border-b-2 focus:border-blue-600 border-b border-gray-300"
        placeholder="10"  
      >
    </td>
    <td class="px-3 py-3 break-text break-all w-[120px]">
    <div class="flex items-center gap-2">
      <input 
        type="checkbox" 
        checked={row.apply_tax === 10}
        onchange={(e) => updateValue("apply_tax", row.apply_tax, (e.target as HTMLInputElement).checked ? 10 : 0)}
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      >
      <span class="text-xs text-gray-600">Apply Tax</span>
    </div>
  </td>


  
    <td class="px-3 py-3 w-[100px] relative">
      <div class="relative" bind:this={dropdownRef}>
        <button
          type="button"
          class="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          onclick={() => showDropdown = !showDropdown}
        >
          <!-- Pencil/Edit Icon -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
        </button>
        
        {#if showDropdown}
          <div class="absolute right-0 top-10 z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] max-h-60 overflow-y-auto">
            <button
              type="button"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              onclick={() => {
                // Edit functionality - focus on first input
                const firstInput = document.querySelector(`tr:has(input[value="${row.name}"]) input`);
                if (firstInput) (firstInput as HTMLInputElement).focus();
                showDropdown = false;
              }}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit
            </button>
            
            <button
              type="button"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              onclick={() => {
                duplicateRow();
                showDropdown = false;
              }}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Duplicate
            </button>
            
            <button
              type="button"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-b border-gray-100"
              onclick={() => {
                deleteRow();
                showDropdown = false;
              }}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete
            </button>
            
            <button
              type="button"
              class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              onclick={() => {
                generateVoucher(rowToPDF(row));
                showDropdown = false;
              }}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Save as PDF
            </button>
          </div>
        {/if}
      </div>
    </td>
  </tr>

  <style>
  td {
    font-size: 12px;
  }

  ::placeholder {
    font-size: 12px;
    font-style: italic;
    color: rgba(150, 150, 150, 0.4);
  }

  /* Ensure dropdown appears above table overflow */
  td:last-child {
    overflow: visible;
  }
  </style>