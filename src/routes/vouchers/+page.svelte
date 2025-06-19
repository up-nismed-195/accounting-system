<script>
    import Row from "./Row.svelte";
    import { table_data } from "./data.svelte";

    const headers = ["ID", "Project", "Date", "No.", "Payee", "Amount", "Mode",
                    "Particulars", "Gross", "Remarks", "Address", "Authorized Rep", "Approver", 
                    "Apply", "Actions"]

    function addRow() {
      let toAdd = {
        "Project": '1',
        "Date": '2', 
        "No.": '3', 
        "Payee": '4', 
        "Amount": '5',
        "Mode": '6',   
        "Particulars": '7', 
        "Gross": "8",
        "Remarks": '9', 
        "Address": '10',
        "Authorized Rep": '11',
        "Approver": '12',
        "Apply Tax": false,
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

