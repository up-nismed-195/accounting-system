<script lang="ts">
    import { supabase } from '$lib/supabaseClient.js';
    import { onMount } from 'svelte';
    import Spinner from '$lib/components/Spinner.svelte';
    import { projectsLoading, liquidationsLoading } from '$lib/stores/stores';
    import NewProject from './NewProject.svelte';
    import { generateReport } from './reportGenerator';

    let projects: Project[] = $state([]);
    let selectedProject = $state("")
    let sortBy: string = $state("dv_no")
    let sortOrder: string = $state("ascending")
    let liquidations: LiquidationEntry[] = $state([]);
    let showNewProjectModal = $state(false)

    onMount(async () => {
        await reloadData()
    });

    async function reloadData() {
        await loadProjects()
        await loadLiquidations(selectedProject, sortBy, sortOrder)
    }

    $effect(() => {
        if (selectedProject) {
            loadLiquidations(selectedProject, sortBy, sortOrder);
        }
    });

    async function loadProjects() {
        projectsLoading.set(true)
        let { data } = await supabase.from("project_summaries").select();
        projects = data ?? []
        projectsLoading.set(false)

        if (data && data.length > 0 && !selectedProject) {
            selectedProject = data[0].code
        }
    }

    async function loadLiquidations(project: string, sortBy: string, sortOrder: string) {
        liquidationsLoading.set(true)
        const { data } = await supabase
            .from("liquidations")
            .select()
            .eq("project_code", selectedProject)
            .order(sortBy, { ascending: sortOrder === "ascending" })

        liquidations = data ?? []
        liquidationsLoading.set(false)
    }

    function generatePDFReport() {
        generateReport(liquidations)
    }

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

    async function deleteProject(code: string) {
        const confirmed = confirm(`Are you sure you want to delete project "${code}"? This cannot be undone.`);
        if (!confirmed) return;

        const { error } = await supabase
            .from('project')
            .delete()
            .eq('code', code);

        if (error) {
            alert('Failed to delete project.');
            console.error('Delete error:', error);
            return;
        }

        projects = projects.filter(p => p.code !== code);

        if (selectedProject === code) {
            selectedProject = projects.length > 0 ? projects[0].code : "";
        }

        alert(`Project "${code}" deleted.`);
    }
</script>

<!-- HEADER -->
<div class="flex justify-between items-center gap-5">
    <div class="flex justify-start items-center gap-5">
        <h1 class="text-4xl font-semibold"><a href="#top">View Project</a></h1>
        {#if $projectsLoading}
            <Spinner />
        {:else}
            <select bind:value={selectedProject} class="bg-primary/10 text-sm rounded-lg border-2 border-primary py-2.5 px-2">
                <option value=""></option>
                {#each projects as project}
                    <option value={project.code}>{project.code}</option>
                {/each}
            </select>
            <div class="-mx-2 py-3 text-black/30">•</div>
            <div class="flex gap-2 items-center">
                <select bind:value={sortBy} class="bg-secondary/10 text-sm rounded-lg border-2 border-secondary py-2.5 px-2">
                    {#each [
                        { value: "dv_no", title: "DV No." },
                        { value: "payee_name", title: "Payee" },
                        { value: "gross", title: "Gross" },
                        { value: "net_amount", title: "Net" },
                        { value: "voucher_date", title: "Date" },
                        { value: "amount_taxed", title: "Tax" }
                    ] as { value, title }}
                        <option value={value}>Sort by {title}</option>
                    {/each}
                </select>
                <select bind:value={sortOrder} class="bg-secondary/10 text-sm rounded-lg border-2 border-secondary py-2.5 px-2">
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                </select>
            </div>
        {/if}
    </div>

    <div class="flex justify-end items-center gap-4">
        <button
            class="border text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
            on:click={generatePDFReport}
        >
            Generate Liquidation Report
        </button>
    </div>
</div>

<hr class="border-black/10 border-1 mt-3 mb-3 border-dashed">

<!-- LIQUIDATIONS TABLE -->
<div class="mt-2 relative overflow-x-auto border border-black/15 shadow-sm">
    <table class="w-full text-sm text-left text-black">
        <thead class="text-xs text-white bg-primary">
            <tr>
                <th scope="col" class="px-3 py-3 text-left">Payee</th>
                <th scope="col" class="px-3 py-3 text-left">DV No.</th>
                <th scope="col" class="px-3 py-3 text-left">Date</th>
                <th scope="col" class="px-3 py-3 text-left">Particulars</th>
                <th scope="col" class="px-3 py-3 text-right">Gross (PHP)</th>
                <th scope="col" class="px-3 py-3 text-right">Taxed (PHP)</th>
                <th scope="col" class="px-3 py-3 text-right">Net (PHP)</th>
            </tr>
        </thead>
        <tbody class="text-[13px]">
            {#each liquidations as liquidation}
                <tr class="text-xs border-b border-gray-200 hover:bg-gray-100">
                    <td class="px-3 py-4 max-w-[200px] break-words text-left">{liquidation.payee_name}</td>
                    <td class="px-3 py-4 text-left">{liquidation.dv_no}</td>
                    <td class="px-3 py-4 text-left">{new Date(liquidation.voucher_date).toLocaleDateString()}</td>
                    <td class="px-3 py-4 max-w-[200px] break-words text-left">{liquidation.particulars}</td>
                    <td class="px-3 py-4 text-right">{liquidation.gross?.toFixed(2)}</td>
                    <td class="px-3 py-4 text-right">{liquidation.amount_taxed?.toFixed(2)}</td>
                    <td class="px-3 py-4 text-right">{liquidation.net_amount?.toFixed(2)}</td>
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
        class="border text-white bg-secondary hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
        on:click={createNewProject}
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
        <table class="w-full text-sm text-left text-black">
            <thead class="text-xs text-white bg-primary">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left">Project Code</th>
                    <th scope="col" class="px-6 py-3 text-left">Project Title</th>
                    <th scope="col" class="px-6 py-3 text-center">Total Vouchers</th>
                    <th scope="col" class="px-6 py-3 text-right">Gross Total (PHP)</th>
                    <th scope="col" class="px-6 py-3 text-right">Net Total (PHP)</th>
                    <th scope="col" class="px-6 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each projects as project}
                    <tr class="bg-white border-b border-gray-200 hover:bg-gray-50">
                        <td class="px-6 py-3 text-left">{project.code}</td>
                        <td class="px-6 py-3 text-left">{project.name}</td>
                        <td class="px-6 py-3 text-center">{project.total_vouchers}</td>
                        <td class="px-6 py-3 text-right">{project.gross_total?.toFixed(2)}</td>
                        <td class="px-6 py-3 text-right">{project.net_total?.toFixed(2)}</td>
                        <td class="px-6 py-3 text-center">
                            <button
                                class="text-red-600 text-xs hover:underline"
                                on:click={() => deleteProject(project.code)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

{#if showNewProjectModal}
    <div class="fixed inset-0 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-lg shadow-lg p-8 min-w-[320px] h-[500px] max-w-lg w-full relative border-2 border-primary/40">
            <button
                class="absolute top-3 right-5 text-gray-500 hover:text-gray-800 font-medium text-2xl"
                on:click={cancelNewProjectModal}
                aria-label="Close"
            >&times;</button>
            <NewProject onClose={closeNewProjectModal} onCancel={cancelNewProjectModal}/>
        </div>
    </div>
{/if}

<style>
    select { outline: 0; }
    option { text-decoration: italic; }
</style>