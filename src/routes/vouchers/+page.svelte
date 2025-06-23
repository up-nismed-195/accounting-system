<script lang="ts">
	import { applyAction } from "$app/forms";
    import Row from "./Row.svelte";
    import { rows } from "./data.svelte";

    const headers = [
      "ID",
      "payee",
      "address",
      "project",
      "particulars",
      "remarks",
      "mode_of_payment",
      "amount",
      "less_tax",
    ]

    function generateRandomString(length: number) {
      let string = ""
      for (let i = 0; i < length; i++) {
        string += String.fromCharCode(97+Math.floor(Math.random() * 26))
      }

      return string
    }

    function addRow() {
      let row: App.VoucherUI = {
        payee: `${generateRandomString(6)}`,
        address: "", 
        project: "NISMED", 
        particulars: "", 
        remarks: "",
        mode_of_payment: "",      
        amount: Math.round(Math.random() * 100), 
        less_tax: Math.round(Math.random() * 2) * 10, 
      }

      $rows = [...$rows, row]
    }
</script>

<button onclick={addRow} class="">add row</button>

<table>
<thead>
  <tr>
    {#each headers as header} 
      <td class="p-2">{header}</td>
    {/each}
  </tr>
</thead>
<tbody>
    {#each $rows as row, index (index)}
        <Row {row} {index} />
    {/each}
</tbody>
</table>
