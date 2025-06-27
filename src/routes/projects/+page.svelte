<script lang="ts">
    import { supabase } from '$lib/supabaseClient.js';

    // ===================
    // mounting, reloading
    // ===================

    import { onMount } from 'svelte';
    import Spinner from '$lib/components/Spinner.svelte';

    onMount(async () => {
        await reloadData()
    })

    async function reloadData() {
        await loadProjects()
        await loadLiquidations(selectedProject, sortBy, sortOrder)
    }

    $effect(() => { 
        if (selectedProject) {
            loadLiquidations(selectedProject, sortBy, sortOrder).then(() => {
                console.log(liquidations)
            });
        }
    })

    // ==============
    // Loading Tables
    // ==============
    
    import { projectsLoading, liquidationsLoading } from '$lib/stores/stores';

    let projects: Project[] = $state([]);
    let selectedProject = $state("")
    let sortBy: string = $state("dv_no")
    let sortOrder: string = $state("ascending")

    async function loadProjects() {
        projectsLoading.set(true)
        let { data } = await supabase.from("project_summaries").select();
        projects = data ?? []
        projectsLoading.set(false)

        if (data && data.length > 0 && !selectedProject) {
            selectedProject = data[0].code
        }
    }

    let liquidations: LiquidationEntry[] = $state([]);
    async function loadLiquidations(project: string, sortBy: string, sortOrder: string) {
        liquidationsLoading.set(true)
        const { data } = await supabase
            .from("liquidations")
            .select()
            .eq("code", selectedProject)
            .order(sortBy, {ascending: sortOrder === 'ascending'})

        liquidations = data ?? []
        liquidationsLoading.set(false)
    }

    // ==================
    // Generating reports
    // ==================

    function generatePDFReport() {
        alert(JSON.stringify(liquidations))
        // TODO: Implement actual PDF generation
    }

    // =============
    // Project Modal
    // =============

    import NewProject from './NewProject.svelte'

    let showNewProjectModal = $state(false)

    function createNewProject() {
        showNewProjectModal = true
    }

    function cancelNewProjectModal() {
        showNewProjectModal = false
    }

    function closeNewProjectModal() {
        showNewProjectModal = false
        reloadData()
    }

    
</script>

<!-- HEADER -->

<div class="flex justify-between items-center gap-5">
    <div class="flex justify-start items-center gap-5">
        <!-- TODO: create collapsible header -->
        <h1 class="text-4xl font-semibold">
            <a href="#top">View Project</a>
        </h1>

        {#if $projectsLoading}<Spinner />{:else} 
        <select bind:value={selectedProject} id="countries" class=" bg-primary/10
        text-sm rounded-lg border-2 border-primary hover:bg-primary/20
        appearance:none font-bold
        py-2.5 px-2">
            <option class="" value=""></option>
            {#each projects as project}
            <option class="" value={project.code}>{project.code}</option>
            {/each}
        </select>

        <div class="-mx-2 py-3 text-black/30">•</div>

        <!-- Sort by UI -->
        <div class="flex gap-2 items-center">
            <select bind:value={sortBy} id="countries" class=" bg-secondary/10
            text-sm rounded-lg border-2 border-secondary hover:bg-secondary/20
            appearance:none
            py-2.5 px-2">
                {#each [
                    {value: "dv_no", title: "DV No."},
                    {value: "payee_name", title: "Payee"},
                    {value: "gross", title: "Gross"},
                    {value: "net_amount", title: "Net"},
                    {value: "voucher_date", title: "Date"},
                    {value: "amount_taxed", title: "Tax"},
                ] as {value, title}}
                    <option class="" value={value}>Sort by {title}</option>
                {/each}
            </select>

            <select bind:value={sortOrder} id="countries" class=" bg-secondary/10
            text-sm rounded-lg border-2 border-secondary hover:bg-secondary/20
            appearance:none
            py-2.5 px-2">
                {#each [
                    {value: "ascending", title: "Ascending"},
                    {value: "descending", title: "Descending"},

                ] as {value, title}}
                    <option class="" value={value}>{title}</option>
                {/each}
            </select>

        </div>

        {/if}    
    </div>

    <div class="flex justify-end items-center gap-4">
        <button
            type="button"
            class="border text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onclick={generatePDFReport}
        >
            Generate Liquidation Report
        </button>
    </div>
</div>

<hr class="border-black/10 border-1 mt-3 mb-3 border-dashed">

<!-- LIQUIDATION TABLE -->

<div class="mt-2 relative overflow-x-auto border border-black/15 shadow-sm">
    
<table class="w-full text-sm text-left rtl:text-right text-black">
<thead class="text-xs text-white bg-primary">
<tr>
    {#each [
        "Payee",
        "DV No.",
        "Date",
        "Particulars",
        "TIN No.",
        "Gross (PHP)",
        "Taxed (PHP)",
        "Net (PHP)",
        "Remarks"
    ] as column}
    <th scope="col" class="px-3 py-3">
        {column}
    </th>
    {/each}
    <th scope="col" class="px-3 py-3">
        <span class="sr-only">Edit</span>
    </th>
</tr>
</thead>
<tbody class="text-[13px]">
{#each liquidations as liquidation}
    <tr class="text-xs border-b border-gray-200 hover:bg-gray-100 ">
    {#each [
        liquidation.payee_name,
        liquidation.dv_no,
        liquidation.voucher_date,
        liquidation.particulars,
        liquidation.tin_no,
        `${liquidation.gross}.00`,
        `${liquidation.amount_taxed}.00`,
        `${liquidation.net_amount}.00`,
        liquidation.remarks,
    ] as entry}
        <td class="px-2 py-4 max-w-[200px] break-words">
            {entry}
        </td>
    {/each}
        <td class="px-5 py-4 text-right">
            <a href="#" class="font-medium text-blue-600  hover:underline">Edit</a>
        </td>
    </tr>
{/each}
</tbody>
</table>
</div>

<hr class="border-black/20 border-1 mt-10 border-dashed">

<!-- ALL PROJECTS -->

<div class="flex justify-start items-center gap-4 mt-3">
    <h1 class="text-3xl font-semibold">All Projects</h1>
    <div class="-mx-1.5 py-3 text-black/30">•</div>
    <button
        type="button"
        class="border text-white bg-secondary hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
        onclick={createNewProject}
    >
    Create New Project
    </button>
</div>



<!-- PROJECTS TABLE -->

{#if $projectsLoading}
<div class="mt-2 w-full h-30 flex items-center justify-center">
    <Spinner />
</div>
{:else}


<div class="mt-2 relative overflow-x-auto border border-black/15 shadow-sm">
<table class="w-full text-sm text-left rtl:text-right text-black">
<thead class="text-xs text-white bg-primary">
<tr>
    {#each [
        "Project Code",
		"Project Title",
		"Total Payees",
		"Total vouchers",
        "Gross Total (PHP)",
		"Net Total (PHP)",
    ] as column}
    <th scope="col" class="px-6 py-3">
        {column}
    </th>
    {/each}
</tr>
</thead>
<tbody>
{#each projects as project}
    <tr class="bg-white border-b  border-gray-200 hover:bg-gray-50 ">
        <td class="px-6 py-3 whitespace-nowrap">
            {project.code}
        </td>
        <td class="px-6 py-3">
            {project.name}
        </td>
        <td class="px-6 py-3">
            {project.total_payees}
        </td>
        <td class="px-6 py-3">
            {project.total_vouchers}
        </td>   
         <td class="px-6 py-3">
            {project.gross_total}.00
        </td>
        <td class="px-6 py-3">
            {project.net_total}.00
        </td>
    </tr>
{/each}
</tbody>
</table>
</div>
{/if}

<style>
    select {
        outline: 0;
    }
    option {
        text-decoration: italic;
    }
</style>

{#if showNewProjectModal}
    <div class="fixed inset-0 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-lg shadow-lg p-8 min-w-[320px] h-[350px] max-w-lg w-full relative
        border-2 border-primary/40">
            <button
                class="absolute top-3 right-5 text-gray-500 hover:text-gray-800 
                font-medium text-2xl"
                onclick={cancelNewProjectModal}
                aria-label="Close"
            >&times;</button>
            <NewProject onClose={closeNewProjectModal} onCancel={cancelNewProjectModal}/>
        </div>
    </div>
{/if}