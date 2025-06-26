<script lang="ts">
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient.js';
    import { projects, liquidations, projectsLoading } from '$lib/stores/stores';
    import Spinner from '$lib/components/Spinner.svelte';

    let selectedProject = $state<string>("")
    let sortBy: string = $state("dv_no")
    let sortOrder: string = $state("ascending")

    async function loadProjects() {
        projectsLoading.set(true)
        let { data } = await supabase.from("project").select("code,name");
        projects.set(data ?? [])
        projectsLoading.set(false)

        if (data && data.length > 0 && !selectedProject) {
            selectedProject = data[0].code
        }
    }

    async function loadLiquidations(project: string, sortBy: string, sortOrder: string) {
        const { data } = await supabase
            .from("liquidations")
            .select()
            .eq("code", selectedProject)
            .order(sortBy, {ascending: sortOrder === 'ascending'})
        liquidations.set(data ?? [])
        console.log($liquidations)
    }

    onMount(async () => {
        if ($projects.length == 0) {
            await loadProjects() 
        }
        
        if ($projects && $projects.length > 0 && !selectedProject) {
            selectedProject = $projects[0].code
        }

        console.log($projects)
    })

    $effect(() => { 
        if (selectedProject) {
            loadLiquidations(selectedProject, sortBy, sortOrder)
        }
    })

    function generatePDFReport() {
        alert("Generating Liquidation Report PDF...");
        // TODO: Implement actual PDF generation
    }
</script>

<!-- HEADER -->

<div class="flex justify-between items-center gap-5">
    <div class="flex justify-start items-center gap-5">
        <h1 class="text-4xl font-semibold">
            <a href="#top">View Project</a>
        </h1>

        {#if $projectsLoading}<Spinner />{:else} 
        <select bind:value={selectedProject} id="countries" class=" bg-primary/10
        text-sm rounded-lg border-2 border-primary hover:bg-primary/20
        appearance:none
        py-2.5 pl-3">
            {#each $projects as project}
            <option class="" value={project.code}>{project.code}</option>
            {/each}
        </select>

        <div class="-mx-2 py-3 text-black/30">•</div>

        <!-- Sort by UI -->
        <div class="flex gap-2 items-center">
            <label for="sortBy" class="font-medium text-green-900">Sort by:</label>
            <select id="sortBy" bind:value={sortBy} class="rounded-lg border border-green-300 px-2 py-1 text-sm focus:ring-2 focus:ring-green-400">
                <option value="dv_no">No.</option>
                <option value="payee_name">Payee</option>
                <option value="gross">Gross Amount</option>
                <option value="amount_taxed">Tax</option>
            </select>
            <button
                class="border rounded px-2 py-1 text-green-900 bg-green-50 hover:bg-green-100 flex items-center justify-center sort-arrow-btn"
                on:click={() => sortOrder = sortOrder === "ascending" ? "descending" : "ascending"}
                aria-label="Toggle sort order"
            >
                {#if sortOrder === "ascending"}
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <polygon points="10,6 15,13 5,13" fill="#166534"/>
                    </svg>
                {:else}
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <polygon points="10,14 15,7 5,7" fill="#166534"/>
                    </svg>
                {/if}
            </button>
        </div>
        <!-- End Sort by UI -->

        {/if}    
    </div>

    <div class="flex justify-end items-center gap-4">
        <button
            type="button"
            class="border text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            on:click={generatePDFReport}
        >
            Generate Liquidation Report
        </button>
    </div>
</div>

<hr class="border-black/10 border-1 mt-3 mb-3 border-dashed">

<!-- LIQUIDATION TABLE -->

<div class="relative overflow-x-auto border border-black/15">
<table class="w-full text-sm text-left rtl:text-right text-black">
<thead class="text-xs text-white bg-primary">
<tr>
    {#each [
        "Payee",
        "DV No.",
        "Date",
        "Particulars",
        "TIN No.",
        "Gross",
        "Taxed",
        "Net",
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
<tbody>
{#each $liquidations as liquidation}
    <tr class=" border-b border-gray-200 hover:bg-gray-100 ">
    {#each [
        liquidation.payee_name,
        liquidation.dv_no,
        liquidation.voucher_date,
        liquidation.particulars,
        liquidation.tin_no,
        liquidation.gross,
        liquidation.amount_taxed,
        liquidation.net_amount,
        liquidation.remarks,
    ] as entry}
        <td class="px-2 py-4 max-w-[200px]">
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

<!-- ALL PROJECTS -->

<h1 class="text-3xl font-semibold mt-9">All Projects</h1>
<hr class="border-black/20 border-1 mt-3 mb-3 border-dashed">

<!-- PROJECTS TABLE -->

<div class="relative overflow-x-auto border border-black/15">
    <table class="w-full text-sm text-left rtl:text-right text-black">
        <thead class="text-xs text-white bg-primary">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Project Code
                </th>
                <th scope="col" class="px-6 py-3">
                    Project
                </th>
                <th scope="col" class="px-6 py-3">
                    Total   
                </th>
                <th scope="col" class="px-6 py-3">
                    Actions
                </th>
                <th scope="col" class="px-6 py-3">
                    <span class="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr class="bg-white border-b  border-gray-200 hover:bg-gray-50 ">
                <td scope="row" class="px-6 py-4 text-gray-900 whitespace-nowrap ">
                    Apple MacBook Pro 17"
                </td>
                <td class="px-6 py-4">
                    Silver
                </td>
                <td class="px-6 py-4">
                    Laptop
                </td>
                <td class="px-6 py-4">
                    $2999
                </td>
                <td class="px-6 py-4 text-right">
                    <a href="#" class="font-medium text-blue-600  hover:underline">Edit</a>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<style>
    select {
        outline: 0;
    }
    option {
        text-decoration: italic;
    }
    .sort-arrow-btn {
        width: 2.2rem;
        height: 2.2rem;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1.5px solid #bbf7d0;
        background: #f0fdf4;
        margin-left: 0.2rem;
        transition: background 0.12s, border 0.12s;
    }
    .sort-arrow-btn:focus, .sort-arrow-btn:hover {
        background: #bbf7d0;
        border-color: #22c55e;
    }
</style>