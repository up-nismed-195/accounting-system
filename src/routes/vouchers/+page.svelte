<script lang="ts">
  import { applyAction } from "$app/forms";
  
  import Row from "./Row.svelte";
  import { rows } from "./data.svelte";
  import { generateRandomVoucherData } from "./helpers";
  import { generateVoucher } from "./helpers";

  let data = $props();

  let selectedProject = $state("")
  
  let summaries: Record<string, number> = $state({})

  let projectInfo: Record<string, { approver?: string; authorized_rep?: string; tax_value?: number }> = $state({})

  let commonInfo = $derived({
    project: selectedProject,
    summaries: summaries,
    selectedProject: selectedProject,
    projectTaxValue: projectInfo[selectedProject]?.tax_value || 0
  })

  let authorized_rep = $derived(projectInfo[selectedProject]?.authorized_rep)
  let approver = $derived(projectInfo[selectedProject]?.approver)
  let tax_value = projectInfo[selectedProject]?.tax_value || 0;

  // Add loading state
  let vouchersLoading = $state(false);

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

  // Load existing vouchers for selected project
  async function loadVouchersForProject(projectCode: string) {
    if (!projectCode) {
      $rows = [];
      return;
    }

    vouchersLoading = true;
    try {
      const { data: voucherData, error } = await supabase
        .from("voucher")
        .select("*")
        .eq("project_code", projectCode)
        .order("dv_no", { ascending: true });

      if (error) {
        console.error("Error loading vouchers:", error);
        alert("Error loading vouchers from database");
        return;
      }

      // Convert database vouchers to VoucherEntry format
      const loadedVouchers: VoucherEntry[] = (voucherData || []).map(voucher => ({
        id: voucher.id || crypto.randomUUID(),
        name: voucher.payee_name || "",
        address: "", // We'll need to get this from payee table
        particulars: voucher.particulars || "",
        mode: voucher.payment_mode || "Cash",
        remarks: voucher.remarks || "",
        amount: voucher.amount?.toString() || "0",
        apply_tax: voucher.apply_tax || false,
        dv_no: voucher.dv_no || ""
      }));

      // Load payee addresses for each voucher
      for (const voucher of loadedVouchers) {
        if (voucher.name) {
          const { data: payeeData } = await supabase
            .from("payee")
            .select("address")
            .eq("name", voucher.name)
            .single();
          
          if (payeeData) {
            voucher.address = payeeData.address || "";
          }
        }
      }

      $rows = loadedVouchers;
    } catch (error) {
      console.error("Error loading vouchers:", error);
      alert("Error loading vouchers from database");
    } finally {
      vouchersLoading = false;
    }
  }

  // Watch for selectedProject changes and load vouchers
  $effect(() => {
    if (selectedProject) {
      loadVouchersForProject(selectedProject);
    }
  });

  // Auto-save function for new rows
  async function saveRowToDatabase(row: VoucherEntry) {
    let voucherIndex = commonInfo.summaries[commonInfo.selectedProject] + $rows.findIndex(r => r.id === row.id) + 1
    let dv_no = `${selectedProject}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`

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
        apply_tax: row.apply_tax,
        authorized_representative: authorized_rep,
        approver: approver,
        particulars: row.particulars,
        remarks: row.remarks
      })
      .select()

    if (payeeError || voucherError) {
      console.error("Error saving:", payeeError || voucherError);
      throw new Error("Error saving data to database");
    } else {
      console.log("Row saved successfully");
    }
  }
  
  async function addRow() {      
    let row: VoucherEntry = generateRandomVoucherData();
    row.id = crypto.randomUUID();
    row.apply_tax = false;
    
    $rows = [...$rows, row];
    
    // Auto-save to database
    try {
      await saveRowToDatabase(row);
      await loadProjects();
    } catch (error) {
      console.error("Error auto-saving row:", error);
      alert("Error saving new row to database");
    }
  }

  // Updated saveAllToDatabase function
  async function saveAllToDatabase() {
    if ($rows.length === 0) {
      alert("No rows to save");
      return;
    }

    if (!selectedProject) {
      alert("Please select a project first");
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of $rows) {
        try {
          // Generate DV number for each row
          let rowIndex = $rows.findIndex(r => r.id === row.id);
          let voucherIndex = commonInfo.summaries[selectedProject] + rowIndex + 1;
          let dv_no = `${selectedProject}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`;

          // Save payee first
          const { error: payeeError } = await supabase
            .from("payee")
            .upsert({name: row.name, address: row.address});

          if (payeeError) throw payeeError;

          // Save or update voucher
          const { error: voucherError } = await supabase
            .from("voucher")
            .upsert({
              dv_no: row.dv_no || dv_no,
              payee_name: row.name,
              project_code: selectedProject,
              payment_mode: row.mode,
              voucher_date: new Date().toISOString(),
              amount: parseFloat(row.amount) || 0,
              apply_tax: row.apply_tax,
              authorized_representative: authorized_rep,
              approver: approver,
              particulars: row.particulars,
              remarks: row.remarks
            });

          if (voucherError) throw voucherError;

          successCount++;
        } catch (error) {
          console.error(`Error saving row ${row.name}:`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        alert(`All ${successCount} vouchers saved successfully!`);
      } else {
        alert(`${successCount} vouchers saved successfully, ${errorCount} failed. Check console for details.`);
      }

      // Refresh data after saving
      await loadProjects();
      await loadVouchersForProject(selectedProject);
    } catch (error) {
      console.error("Error in saveAllToDatabase:", error);
      alert("Error saving vouchers to database");
    }
  }

  // Add refresh function
  async function refreshVouchers() {
    await loadVouchersForProject(selectedProject);
    await loadProjects();
  }

  import { padZeroes } from "./helpers";

  function generateAllVouchers() {
    $rows.forEach((row, index) => {
      let voucherIndex = commonInfo.summaries[commonInfo.selectedProject] + index + 1
      let dv_no = `${selectedProject}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`

      data = {
        name: row.name,
        address: row.address,
        particulars: row.particulars,
        dv_no: dv_no,
        project_name: selectedProject,
        mode: row.mode,
        remarks: row.remarks,
        amount: row.amount,
        apply_tax: row.apply_tax,
        tax_rate: commonInfo.projectTaxValue,
        authorized_rep: authorized_rep,
        approver: approver,
        date: new Date().toISOString(),
      }

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
        tax_value: item.tax_value
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
        <a href="#top">Manage Vouchers</a> 
      </h1> 
      {#if $projectsLoading}
        <Spinner />
      {:else}
      <select bind:value={selectedProject} id="countries" class=" bg-primary/10
      text-sm rounded-lg border-2 border-primary hover:bg-primary/20
      appearance:none font-bold
      py-2.5 px-2">
          <option value="">Select Project</option>
          {#each projects as project}
            <option class="" value={project}>{project}</option>
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
            disabled={!selectedProject}
      >
        Add Row
      </button>
    </div>

    <div style="">
      <button
            type="button"
            class="border text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onclick={refreshVouchers}
            disabled={!selectedProject}
      >
        Refresh
      </button>
    </div>
  </div>

  <div class="flex gap-1">
    <button
      type="button"
      class="border text-white bg-blue-600 hover:bg-blue-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
      onclick={saveAllToDatabase}
      disabled={!selectedProject}
    >
      Save all to Database
    </button>
    <button
      type="button"
      class="border text-white bg-red-600 hover:bg-red-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
      onclick={generateAllVouchers}
      disabled={!selectedProject}
    >
      Download all as PDF
    </button>
  </div>
</div>

{#if selectedProject}
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

    <div class="text-black/30">•</div>

    <div class="flex justify-start gap-2">
      <span class="font-medium text-sm">Total Vouchers: {$rows.length}</span> 
    </div>
  </div>
{/if}

<!--
  ===============
  TABLE
  ===============
--> 

{#if selectedProject}
  {#if vouchersLoading}
    <div class="mt-4 w-full h-40 flex items-center justify-center border border-black/15">
      <Spinner />
    </div>
  {:else}
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
            <Row {row} {index} {commonInfo} {approver} {authorized_rep} {tax_value}/>
          {/each}
          {#if $rows.length === 0}
            <tr>
              <td colspan="9" class="px-6 py-8 text-center text-gray-500">
                No vouchers found for this project. Click "Add Row" to create a new voucher.
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  {/if}
{:else}
  <div class="mt-4 w-full h-40 flex items-center justify-center border border-black/15 bg-gray-50">
    <p class="text-gray-500">Please select a project to view and manage vouchers.</p>
  </div>
{/if}

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