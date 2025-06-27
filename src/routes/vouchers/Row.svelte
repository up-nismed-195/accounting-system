<script lang="ts">
	import { onMount } from 'svelte';
  import { rows } from './data.svelte.js';

  // ===================
  // destructuring props
  // ==================
  
  let { row, index, commonInfo } = $props<{
    row: VoucherEntry;
    index: number;
    commonInfo: {
      project: string,
      authorizedRep: string,
      approver: string,
      summaries: Record<string, number>,
    };
  }>();

  // let { project, authorizedRep, approver, summaries } = commonInfo

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
  

  function deleteRow() {
    $rows = $rows.filter(r => r.id !== row.id);
  }

  function updateValue(key: string, current: string, value: any) {
    $rows = $rows.map(r => {
      if (r.id === row.id) {
        console.log("key", key)
        return { 
          name: key == "name" ? value : r.name,
          address: key == "address" ? value : r.address,
          id: key == "id" ? value :r.id,
          dv_no: key == "dv_no" ? value : r.dv_no,
          particulars: key == "particulars" ? value : r.particulars,
          mode: key == "mode" ? value : r.mode,
          remarks: key == "remarks" ? value : r.remarks,
          amount: key == "amount" ? value : r.amount,
          tax: key == "tax" ? value : r.tax,
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
      project_name: commonInfo.selectedProject,
      mode: row.mode,
      remarks: row.remarks,
      amount: row.amount,
      tax: row.tax,
      total: row.amount - (0.01 * row.tax * row.amount),
      authorized_rep: commonInfo.authorizedRep,
      approver: commonInfo.approver,
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
    // console.log("selectedProject", project)
  })


  onMount(() => {
    // console.log(summaries)
  })
</script>

<tr class="bg-white border-b  border-gray-200 hover:bg-gray-50 "> 
  <td class="px-2 py-3 break-text break-all w-[120px]">
    <!-- <input type="text" 
      oninput={e => updateValue("dv_no", row.dv_no, (e.target as HTMLInputElement).value)}
      value={dv_no}
      class="w-full"
      placeholder="UNICEF-24-001..."
    > -->
    {dv_no}
  </td>
  <td class="px-2 py-3 break-text break-all w-[170px]">
    <input type="text" 
      oninput={e => updateValue("name", row.name, (e.target as HTMLInputElement).value)}
      value={row.name}
      class="w-full"
      placeholder="Juan dela Cruz..."
    >
  </td>
  <td class="px-2 py-1 break-text break-all w-[300px]">
    <input type="text" 
      oninput={e => updateValue("address", row.address, (e.target as HTMLInputElement).value)}
      value={row.address}
      class="w-full"
      placeholder="Pardo de Tavera St, Diliman, Quezon City..."
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[150px]">
    <input type="text" 
      oninput={e => updateValue("particulars", row.particulars, (e.target as HTMLInputElement).value)}
      placeholder="Charged to 250k..."
      value={row.particulars}
      class="w-full"
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[100px]">
    <input type="text" 
      oninput={e => updateValue("mode", row.mode, (e.target as HTMLInputElement).value)}
      value={row.mode}
      class="w-full"
      placeholder="Cash..."
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[150px]">
    <input type="text" 
      oninput={e => updateValue("remarks", row.remarks, (e.target as HTMLInputElement).value)}
      value={row.remarks}
      class="w-full"
      placeholder="Paid on time..."
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[100px]">
    <input type="number" 
      oninput={e => updateValue("amount", row.amount, (e.target as HTMLInputElement).value)}
      value={row.amount}
      class="w-full"
      placeholder="10"  
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[100px]">
    <input type="number" 
      oninput={e => updateValue("tax", row.tax, (e.target as HTMLInputElement).value)}
      value={row.tax}
      class="w-full"
    >
  </td>
 
  <td>
  <div class="flex gap-0.5">
    <button
      type="button"
      class="border text-white bg-secondary hover:bg-blue-800 font-medium rounded-lg text-sm px-2 py-2"
      onclick={() => generateVoucher(rowToPDF(row))}
    >
      PDF
    </button>
    <button
      type="button"
      class="border text-white bg-red-500 hover:bg-red-800 font-medium rounded-lg text-sm px-2 py-2"
      onclick={() => deleteRow()}
    >
      Delete
    </button>
    <button
      type="button"
      class="border text-white bg-primary hover:bg-green-900 font-medium rounded-lg text-sm px-2 py-2"
      onclick={() => saveToDatabase(row)}
    >
      Save
    </button>

    
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



  
/* td {
  font-size: 14px;
}
td > input {
  width: 100%;
  font-size: 14px;
}

input {
  border: 1px solid white;
}


td:hover > input {
  border: 1px solid #1976d2;
  outline: none;
}

td {
  padding: 10px 6px;
  vertical-align: middle;
}

button {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 0.05em 0.7em;
  font-size: 0.98em;
  cursor: pointer;
  transition: background 0.15s, border 0.15s;
}

button:hover {
  background: #f6f8fa;
  border-color: #b4b4b4;
} */
</style>