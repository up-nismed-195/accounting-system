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
    {#each keys as key}
        <td class="px-2 py-3 max-w-[200px] break- break-all">
            {row[key]}
        </td>
    {/each}
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