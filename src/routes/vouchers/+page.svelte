<script>
    import Row from "./Row.svelte";
    import { table_data } from "./data.svelte";

    const headers = ["ID", "Project", "Date", "DV No.", "Payee", "Amount", 
                    "Particular", "Gross", "Remarks", "Address", "Actions"]

    function addRow() {
      let toAdd = {
        "Project": Math.round(Math.random() * 100, 2),
        "Date": 1, 
        "DV No.": 1, 
        "Payee": 1, 
        "Amount": 1,      
        "Particular": 1, 
        "Gross": 1, 
        "Remarks": 1, 
        "Address": Math.round(Math.random() * 100, 2),
      }

      $table_data.rows = [...$table_data.rows, toAdd]
    }

  function generateVouchers() {
    console.log($table_data.rows)
  }    

</script>

<div class="flex mb-5 gap-2 text-white">
  <button onclick={addRow} class="bg-emerald-500 hover:bg-emerald-600">add row</button>
  <button onclick={generateVouchers} class="bg-blue-500 hover:bg-blue-600">generate vouchers</button>
</div>



<table>
<thead>
<tr>
  {#each headers as header} 
    <td class="p-2">{header}</td>
  {/each}
</tr>
</thead>
<tbody>
    {#each $table_data.rows as row, i (i)}
        <Row {row} {i} />
    {/each}
</tbody>
</table>
