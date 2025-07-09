<script lang="ts">
  import { applyAction } from "$app/forms";
  
  import Row from "./Row.svelte";
  import { rows } from "./data.svelte";
  import { generateRandomVoucherData } from "./helpers";
  import { generateVoucher } from "./helpers";

  let data = $props();

  let selectedProject = $state("")
  
  let summaries: Record<string, {vouchers: number, name: string}> = $state({})

  let projectInfo = $state({})

  let commonInfo = $derived({
    project: selectedProject,
    summaries: summaries,
    selectedProject: selectedProject,
    projectTaxValue: projectInfo[selectedProject]?.tax_value || 0  // Added tax value
  })

  

  let authorized_rep = $derived(projectInfo[selectedProject]?.authorized_rep)
  let approver = $derived(projectInfo[selectedProject]?.approver)

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

  // Auto-save function for new rows
  async function saveRowToDatabase(row: VoucherEntry) {
    const voucherIndex = (summaries[selectedProject]?.vouchers ?? 0) + $rows.length;
    const dv_no = `${selectedProject}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`;
    
    // Save payee first
    const { data: payeeData, error: payeeError } = await supabase
      .from("payee")
      .upsert({name: row.name, address: row.address})
      .select()

    // Save voucher with apply_tax boolean
    const { data: voucherData, error: voucherError } = await supabase
      .from("voucher")
      .upsert({
        dv_no: dv_no,
        payee_name: row.name,
        project_code: selectedProject,
        payment_mode: row.mode,
        voucher_date: new Date().toISOString(),
        amount: row.amount,
        apply_tax: row.apply_tax,  // Boolean instead of tax percentage
        authorized_representative: authorized_rep,
        approver: approver  
      })
      .select()

    if (payeeError || voucherError) {
      console.error("Error saving:", payeeError || voucherError);
      alert("Error saving data to database");
    } else {
      console.log("Row saved successfully");
    }

    await loadProjects(); // Refresh summaries
  }
  
  async function addRow() {      
    let row: VoucherEntry = generateRandomVoucherData();
    row.id = crypto.randomUUID();
    row.apply_tax = false; // Default to false
    
    $rows = [...$rows, row];
    
    // Auto-save to database
    await saveRowToDatabase(row);
  }

  import { padZeroes } from "./helpers";

  function generateAllVouchers() {
    $rows.forEach((row, index) => {
      let voucherIndex = $derived((summaries[selectedProject]?.vouchers ?? 0) + index + 1)
      let dv_no = $derived(`${selectedProject}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`)

      const projectTaxValue = projectInfo[selectedProject]?.tax_value || 0;
      
      const data = {
          name: row.name,
          address: row.address,
          dv_no: dv_no,
          particulars: row.particulars,
          mode: row.mode,
          remarks: row.remarks,
          amount: row.amount,
          tax: row.apply_tax ? projectTaxValue : 0,  // Use project tax if apply_tax is true
          project_name: selectedProject,
          date: Date.now().toString(),
          total: row.amount - (row.apply_tax ? (0.01 * projectTaxValue * row.amount) : 0),
          authorized_rep: authorized_rep,
          approver: approver,
        };
      generateVoucher(data);
    });
  }

  // =======
  // onMount
  // =======

  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { projectSummaries } from "./projectSummaries";

  function show(data) {
    alert(JSON.stringify(data, null, 2))
  }

  async function loadProjectInfo() {
    const { data, error } = await supabase
      .from("project")
      .select()

    projectInfo = Object.fromEntries(
      (data ?? []).map(item => [item.code, { 
        approver: item.approver, 
        authorized_rep: item.authorized_rep,
        tax_value: item.tax_value  // Added tax_value from project
      }])
    )    
  }
 
  onMount(async () => {
    await loadProjects()
    const { error, data } = await supabase
        .from("project_summaries")
        .select()
    
    projectSummaries.set(data ?? [])
    
    await loadProjectInfo()

    // Restore selected project from localStorage if it exists and is valid
    const saved = localStorage.getItem(SELECTED_PROJECT_KEY);
    if (saved && projects.includes(saved)) {
      selectedProject = saved;
    } else {
      selectedProject = projects.length == 0 ? "" : projects[0];
    }

    // console(summaries)
    // alert(JSON.stringify($projectSummaries))
  })

  // ====================
  // Loading initial data
  // ====================

  import Spinner from "$lib/components/Spinner.svelte";
  import { projectsLoading } from "$lib/stores/stores";

  let projects: string[] = $state([])

  async function loadProjects() {
    $projectsLoading = true
    const { data } = await supabase
        .from("project_summaries")
        .select();

    projects = (data ?? []).map(item => item.code)
    summaries = Object.fromEntries(
      (data ?? []).map(item => [item.code, item.total_vouchers])
    )

    console.log((data ?? []).map(item => [item.code, {
      vouchers: item.vouchers,
      name: item.name
    }]))


    // Remove default assignment here; handled in onMount
    // selectedProject = projects.length == 0 ? "" : projects[0]
    $projectsLoading = false
  }
  
  const SELECTED_PROJECT_KEY = "selectedProject";

  // Persist selectedProject to localStorage whenever it changes
  $effect(() => {
    if (selectedProject) {
      localStorage.setItem(SELECTED_PROJECT_KEY, selectedProject);
    }
  })
</script>

<div class="flex justify-between items-start gap-5">
  <div class="flex justify-start items-center gap-3">
    <div class="flex gap-3 items-center">
      <h1 class="text-4xl font-semibold">
        <a href="#top">Add Vouchers</a> 
      </h1> 
      {#if $projectsLoading}
        <Spinner />
      {:else}
      <select bind:value={selectedProject} id="countries" class=" bg-primary/10
      text-sm rounded-lg border-2 border-primary hover:bg-primary/20
      appearance:none font-bold
      py-2.5 px-2">
          {#each projects as project}
            <option class="" value={project} selected>{project}</option>
          {/each}
      </select>
      {/if}
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
    </div>
  </div>

  <div class="flex gap-1">
    <button
      type="button"
      class="border text-white bg-red-600 hover:bg-red-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
      onclick={generateAllVouchers}
    >
      Download all as PDF
    </button>
  </div>
</div>
  
<div class="mt-4 mb-0.5 gap-2 flex items-center">
  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Authorized representative: {authorized_rep} </span> 
  </div>

  <div class="text-black/30">•</div>

  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Approver: {approver}</span> 
  </div>

  <div class="text-black/30">•</div>

  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Tax Rate: {projectInfo[selectedProject]?.tax_value || 0}%</span> 
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
      <th scope="col" class="px-3 py-3">{header}</th>
    {/each}
    <th class="p-2"><div class="flex justify-start">Actions</div></th>
  </tr>
</thead>
<tbody>
    {#each $rows as row, index (row.id)}
        <Row {row} {index} {commonInfo} {approver} {authorized_rep}/>
    {/each}
</tbody>
</table>
</div>

<style>

:global(tbody > tr:last-child input) {
  outline: none;
  border-bottom: 1px solid rgba(150, 150, 150, 0.82);
}

:global(input:focus), :global(tbody > tr:last-child input:focus) {
  outline: none;
  border-bottom: 2px solid var(--color-secondary);
}

</style>