<script lang="ts">
  import { rows } from './data.svelte.js';
  import { generateVoucher } from './helpers.js';

  const { row, index, selectedProject, authorizedRep, approver } = $props<{
    row: App.VoucherUI;
    index: number;
    selectedProject: string;
    authorizedRep: string;
    approver: string;
  }>();

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

  function rowToPDF(row: App.VoucherUI): App.VoucherPDF {
    return {
      payee: row.payee,
      address: row.address,
      project: selectedProject,
      particulars: row.particulars,
      mode_of_payment: row.mode_of_payment,
      remarks: row.remarks,
      gross: row.gross,
      less_tax: row.less_tax,
      authorized_rep: authorizedRep,
      approver: approver,
    }
  }
 

  let BASE = 23
  let dv = $derived(`${selectedProject}-${new Date().getFullYear().toString().slice(2)}-${BASE + index}`)
  
  $effect(() => {
    console.log($rows);
  })
</script>

<tr class="">
    <td>{#if selectedProject}{dv}{:else}{dv.slice(-2)}{/if}</td>
    {#each keys as key}
      <td class="">
          <input 
              type="text" 
              class="underline-input" 
              value={row[key]}
              oninput={e => updateValue(key, e.target.value)}
          />
      </td>
    {/each}
    <td>
    <button onclick={deleteRow} class="">delete</button>
    <button onclick={() => generateVoucher(rowToPDF(row), dv)} class="">pdf</button>
    </td>
</tr>

