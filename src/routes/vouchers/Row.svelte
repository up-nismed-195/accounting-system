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

<style>
input, textarea {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 1em;
  padding: 0.1em 0.2em;
  color: #222;
  resize: none;
}

input:focus, textarea:focus {
  outline: none;
  background: #f6f8fa;
}

td {
  vertical-align: middle;
}

button {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 0.2em 0.7em;
  font-size: 0.98em;
  cursor: pointer;
  transition: background 0.15s, border 0.15s;
}

button:hover {
  background: #f6f8fa;
  border-color: #b4b4b4;
}
</style>