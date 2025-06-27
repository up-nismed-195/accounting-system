<script lang="ts">
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
    };
  }>();

  let { project, authorizedRep, approver } = commonInfo

  // ==============
  // row operations
  // ==============

  const keys = Object.keys(row)
  

  function deleteRow() {
    $rows = [
      ...$rows.slice(0, index),
      ...$rows.slice(index + 1)
    ];
  }

  function updateValue(key: string, value: string) {
    $rows = $rows.map((r, idx) =>
        idx === index ? { ...r, [key]: value } : r
    );
  }

  // ================
  // Generate Voucher
  // ================ 

  import { generateVoucher } from './helpers.js';

  function rowToPDF(row: VoucherEntry): VoucherPDF {
    return {
      name: row.name,
      address: row.address,
      particulars: row.particulars,
      dv_no: row.dv_no,
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
 
  $effect(() => {
    console.log($rows);
  })
  
</script>

<tr class="bg-white border-b  border-gray-200 hover:bg-gray-50 "> 
  <td class="px-2 py-3 break-text break-all w-[100px]">
    <input type="text" 
      oninput={e => updateValue(row.dv_no, (e.target as HTMLInputElement).value)}
      value={row.dv_no}
      class="w-full"
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[200px]">
    <input type="text" 
      oninput={e => updateValue(row.name, (e.target as HTMLInputElement).value)}
      value={row.name}
      class="w-full"
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[250px]">
    <input type="text" 
      oninput={e => updateValue(row.address, (e.target as HTMLInputElement).value)}
      value={row.address}
      class="w-full"
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[150px]">
    <input type="text" 
      oninput={e => updateValue(row.particulars, (e.target as HTMLInputElement).value)}
      value={row.particulars}
      class="w-full"
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[100px]">
    <input type="text" 
      oninput={e => updateValue(row.mode, (e.target as HTMLInputElement).value)}
      value={row.mode}
      class="w-full"
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[150px]">
    <input type="text" 
      oninput={e => updateValue(row.remarks, (e.target as HTMLInputElement).value)}
      value={row.remarks}
      class="w-full"
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[100px]">
    <input type="text" 
      oninput={e => updateValue(row.amount, (e.target as HTMLInputElement).value)}
      value={row.amount}
      class="w-full"
    >
  </td>
  <td class="px-2 py-3 break-text break-all w-[100px]">
    <input type="text" 
      oninput={e => updateValue(row.tax, (e.target as HTMLInputElement).value)}
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

    
  </div>
  </td>
</tr>



<style>

td {
  font-size: 12px;
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