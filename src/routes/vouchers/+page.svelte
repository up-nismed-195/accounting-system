<script lang="ts">
	import { applyAction } from "$app/forms";
    import Row from "./Row.svelte";
    import { rows, projects } from "./data.svelte";
    import { generateRandomVoucherData } from "./helpers";
    import { generateVoucher } from "./helpers";

    let selectedProject = ""
    let authorizedRep = ""
    let approver = ""

    const headers = [
      "ID",
      "payee",
      "address",
      // "project",
      "particulars",
      "mode",
      "remarks",
      "amount",
      "less_tax",
    ]

    
    function addRow() {
      // let row: App.VoucherUI = {
      //   payee: `${generateRandomString(25)}`,
      //   address: `${generateRandomString(30)}`, 
      //   // project: "NISMED", 
      //   particulars: `${generateRandomString(25)}`, 
      //   remarks: `${generateRandomString(12)}`,
      //   mode_of_payment: `${generateRandomString(5)}`,      
      //   amount: Math.round(Math.random() * 50000), 
      //   less_tax: Math.round(Math.random() * 2) * 10, 
      // }
      
      let row: App.VoucherUI = generateRandomVoucherData()
      $rows = [...$rows, row]
    }

    function generateAllVouchers() {
      $rows.forEach((row, index) => {
        // Generate the DV number in the same way as in Row.svelte
        const BASE = 23;
        const dv = `${selectedProject}-${new Date().getFullYear().toString().slice(2)}-${BASE + index}`;
        // Prepare the data as in rowToPDF
        const data = {
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
        };
        generateVoucher(data, dv);
      });
    }
</script>

<div style="dipslay: flex; gap: 3px;">
<button onclick={addRow} class="">add row</button>
<button onclick={generateAllVouchers} class="">Generate All Vouchers</button>
</div>

<div style="display: flex; gap: 3px">
  <span>authorized rep: </span> <input bind:value={authorizedRep} type="text">
</div>
<div style="display: flex; gap: 3px">
  <span>approver: </span> <input bind:value={approver} type="text">
</div>
<div style="display: flex; gap: 3px">
  
  <span>project: </span>
  <select bind:value={selectedProject}>
    <option value="" disabled selected>Select a projects</option>
    {#each $projects as project}
      <option value={project}>{project}</option>
    {/each}
  </select>
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
    {#each $rows as row, index (index)}
        <Row {row} {index} {selectedProject} {authorizedRep} {approver}/>
    {/each}
</tbody>
</table>
