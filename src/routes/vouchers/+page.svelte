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
      console.log($table_data.rows)
    }

    

</script>

<button onclick={addRow} class="border p-2">add row</button>

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
