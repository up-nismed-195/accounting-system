<script lang="ts">
	import { applyAction } from "$app/forms";
	import { onMount } from "svelte";
  import Row from "./Row.svelte";
  import { rows } from "./data.svelte";
  import { generateRandomVoucherData } from "./helpers";
  import { generateVoucher } from "./helpers";

  let data = $props();
  console.log(data)

  let selectedProject = $state("")
  let authorizedRep = $state("")
  let approver = $state("")

  let commonInfo = $derived({
    project: selectedProject,
    authorizedRep: authorizedRep,
    approver: approver
  })

  const headers = [
    "DV No.",
    "Name",
    "Address",
    "Particulars",
    "Mode",
    "Remarks",
    "Amount",
    "Tax",
  ]

  
  function addRow() {      
    let row: VoucherEntry = generateRandomVoucherData()
    $rows = [...$rows, row]
  }

  function generateAllVouchers() {
    $rows.forEach((row, index) => {
      const BASE = 23;
      const data = {
          name: row.name,
          address: row.address,
          particulars: row.particulars,
          dv_no: row.dv_no,
          project_name: selectedProject,
          mode: row.mode,
          remarks: row.remarks,
          amount: row.amount,
          tax: row.tax,
          total: row.amount - (0.01 * row.tax * row.amount),
          authorized_rep: authorizedRep,
          approver: approver,
          date: Date.now().toString(),
        };
      generateVoucher(data);
    });
  }
  
  let projects = ["UNICEF", "NISMED"]
  selectedProject = projects[0]
</script>

<div class="flex justify-between items-start gap-5">
  <div class="flex justify-start items-center gap-3">
    <div class="flex gap-3 items-center">
      <h1 class="text-4xl font-semibold">
        <a href="#top">Add Vouchers</a> 
      </h1> 
      <span class="ml-0.5 -mb-0.5 text-sm">to</span>

      <select bind:value={selectedProject} id="countries" class=" bg-primary/10
      text-sm rounded-lg border-2 border-primary hover:bg-primary/20
      appearance:none font-bold
      py-2.5 px-2">
          {#each projects as project}
            <option class="" value={project} selected>{project}</option>
          {/each}
      </select>
    </div>

    <div class="py-3 text-black/30">•</div>

    <div style="">
      <button
            type="button"
            class="border text-white bg-green-800 hover:bg-green-900 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onclick={addRow}
      >
        Add Row
      </button>
      <button
            type="button"
            class="border text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onclick={generateAllVouchers}
      >
        Generate All Vouchers
      </button>
    </div>
  </div>
</div>
  
<hr class="border-black/10 border-1 my-3 border-dashed">

<div class="mb-0.5 gap-2 flex items-center">
  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Authorized representative: </span> 
    <input bind:value={authorizedRep} class="border-b border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2" type="text">
  </div>

  <div class="text-black/30">•</div>

  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Approver: </span> 
    <input bind:value={approver} class="border-b   border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2"  type="text">
  </div>
</div>
<!--
  ===============
  TABLE
  ===============
--> 

<div class="relative overflow-x-auto border border-black/15 shadow-sm">
<table class="w-full text-sm text-left rtl:text-right text-black">
<thead class="text-xs text-white bg-primary">
  <tr>
    {#each headers as header} 
      <th scope="col" class="px-6 py-3">{header}</th>
    {/each}
    <th class="p-2"><div class="flex justify-start">Actions</div></th>
  </tr>
</thead>
<tbody>
    {#each $rows as row, index (index)}
        <Row {row} {index} {commonInfo}/>
    {/each}
</tbody>
</table>
</div>

<style>


</style>