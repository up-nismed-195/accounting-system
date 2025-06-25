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
            // .order(sortBy)   
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
    })

    $effect(() => { 
        if (selectedProject) {
            loadLiquidations(selectedProject, sortBy, sortOrder)
        }
    })


    // let projects: Project[] = data.projects ?? [];
    // let liquidations: LiquidationEntry[] = data.liquidation ?? [];
</script>

<div class="flex justify-between items-center gap-5">
    <!-- <h1 class="text-3xl font-semibold underline underline-offset-2 decoration-primary/75 hover:decoration-secondary/75"> -->

    <div class="flex justify-start items-center gap-4">
        <h1 class="text-3xl font-semibold">
            <a href="#top">
                Project
            </a>
        </h1>

        {#if $projectsLoading}
            <Spinner />
        {:else} 
            <select bind:value={selectedProject} id="countries" class="font-bold bg-primary/10
            text-sm rounded-lg border-2 border-primary    
            appearance:none
            py-2.5 px-3">
                {#each $projects as project}
                    <option class="" value={project.code}>{project.code}</option>
                {/each}
            </select>   
            <div class="mx-1 border-1 py-3 border-black/10"></div>
            <div class="flex gap-2 items-center">
                <select bind:value={sortBy} id="countries" class=" bg-secondary/10
                text-sm rounded-lg border-2 border-secondary
                appearance:none
                py-2.5 px-3">
                    {#each [
                        {value: "dv_no", title: "DV No."},
                        {value: "payee_name", title: "Payee"},
                        {value: "gross", title: "Gross Amount"},
                        {value: "amount_taxed", title: "Tax"},
                    ] as {value, title}}
                        <option class="" value={value}>Sort by {title}</option>
                    {/each}
                </select>
            </div>

            <div class="flex gap-2 items-center">
                <select bind:value={sortOrder} id="countries" class=" bg-secondary/10
                text-sm rounded-lg border-2 border-secondary
                appearance:none
                py-2.5 px-3">
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

    <div class="flex justify-end items-center gap-8">
        <button type="button" class="border text-white bg-blue-700 hover:bg-blue-800
            focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
            Generate Liquidation Report
        </button>
    </div>
</div>

<hr class="border-black/15 my-5">

<div class="relative overflow-x-auto border-3 border-black/15">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-white bg-primary">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Product name
                </th>
                <th scope="col" class="px-6 py-3">
                    Color
                </th>
                <th scope="col" class="px-6 py-3">
                    Category
                </th>
                <th scope="col" class="px-6 py-3">
                    Price
                </th>
                <th scope="col" class="px-6 py-3">
                    <span class="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Apple MacBook Pro 17"
                </th>
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
                    <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                </td>
            </tr>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Microsoft Surface Pro
                </th>
                <td class="px-6 py-4">
                    White
                </td>
                <td class="px-6 py-4">
                    Laptop PC
                </td>
                <td class="px-6 py-4">
                    $1999
                </td>
                <td class="px-6 py-4 text-right">
                    <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                </td>
            </tr>
            <tr class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Magic Mouse 2
                </th>
                <td class="px-6 py-4">
                    Black
                </td>
                <td class="px-6 py-4">
                    Accessories
                </td>
                <td class="px-6 py-4">
                    $99
                </td>
                <td class="px-6 py-4 text-right">
                    <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                </td>
            </tr>
        </tbody>
    </table>
</div>


<h1 class="text-3xl font-semibold my-7">All Projects</h1>
<hr class="border-black/15 my-5">

<style>
    select {
        outline: 0;
    }
    option {
        text-decoration: italic;
    }
</style>


