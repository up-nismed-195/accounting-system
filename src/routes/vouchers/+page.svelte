<script lang="ts">
	import { applyAction } from "$app/forms";
	
  import Row from "./Row.svelte";
  import { rows } from "./data.svelte";
  import { generateRandomVoucherData } from "./helpers";
  import { generateVoucher } from "./helpers";

  // let data = $props();

  let selectedProject = $state("")
  
  let summaries: Record<string, {vouchers: number, name: string}> = $state({})

  let commonInfo = $derived({
    project: selectedProject,
    summaries: summaries,
    selectedProject: selectedProject,
  })

  let projectInfo = $state({})

  let authorized_rep = $derived(projectInfo[selectedProject]?.authorized_rep)
  let approver = $derived(projectInfo[selectedProject]?.approver)
  let project_name = $derived(projectInfo[selectedProject]?.project_name) 

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
    let row: VoucherEntry = generateRandomVoucherData();
    row.id = crypto.randomUUID(); // assign unique id
    $rows = [...$rows, row];
  }

  import { padZeroes } from "./helpers";

  
  function generateAllVouchers() {
    // console.log($projectSumma  ries)
    
    $rows.forEach((row, index) => {
      let voucherIndex = $derived((summaries[selectedProject]?.vouchers ?? 0) + index + 1)
      let dv_no = $derived(`${selectedProject}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`)

      const BASE = 23;
      const data = {
        name: row.name,
        address: row.address,
        particulars: row.particulars,
        dv_no: dv_no,
        project_name: project_name,
        mode: row.mode,
        remarks: row.remarks,
        amount: row.amount,
        tax: row.tax,
        total: row.amount - (0.01 * row.tax * row.amount),
        authorized_rep: authorized_rep,
        approver: approver,
        date: new Date().toISOString(),
      }
      generateVoucher(data);
    });
  }

  function saveAllVouchers() {
    
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
    const { data, error } = await
    supabase
    .from("project")
    .select()

    projectInfo = Object.fromEntries(
      (data ?? []).map(item => [item.code, { approver: item.approver, authorized_rep: item.authorized_rep, project_name: item.name}])
    )    
  }
 

  onMount(async () => {
    await loadProjects()
    const { error, data } = await supabase
        .from("project_summaries")
        .select()
    
    // alert(JSON.stringi-*fy(summaries))
    // projectSummaries.set(data ?? [])
    
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
      <!-- <span class="ml-0.5 -mb-0.5 text-sm">to</span> -->
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

    <!-- <button
      type="button"
      class="border text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
      onclick={saveAllVouchers}
    >
      Save all
    </button> -->
    <button
      type="button"
      class="border text-white bg-red-600 hover:bg-red-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
      onclick={generateAllVouchers}
    >
      Download all as PDF
    </button>
  </div>
</div>
  
<!-- <hr class="border-black/10 border-1 mt-2 mb-4 border-dashed"> -->

<div class="mt-4 mb-0.5 gap-2 flex items-center">
  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Authorized representative: {authorized_rep} </span> 
    <!-- <input bind:value={authorizedRep} class="border-b border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2" type="text"> -->
  </div>

  <div class="text-black/30">•</div>

  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Approver: {approver}</span> 
    <!-- <input bind:value={approver} class="border-b   border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2"  type="text"> -->
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
        <Row {row} {index} {commonInfo} {approver} {authorized_rep} {project_name}/>
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