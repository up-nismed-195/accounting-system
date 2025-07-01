<script lang="ts">
    import { applyAction } from "$app/forms";
    import Row from "./Row.svelte";
    import { rows } from "./data.svelte";
    import { generateRandomVoucherData } from "./helpers";
    import { generateVoucher } from "./helpers";
    import { padZeroes } from "./helpers";
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabaseClient";
    import Spinner from "$lib/components/Spinner.svelte";
    import { projectsLoading } from "$lib/stores/stores";

    let data = $props();

    let selectedProject = $state("");
    let authorizedRep = $state("");
    let approver = $state("");
    let summaries: Record<string, number> = $state({});
    let selectedRowIds = $state(new Set<string>());
    let editingRowId: string | null = null; // Only one editable row at a time

    let commonInfo = $derived({
        project: selectedProject,
        authorizedRep: authorizedRep,
        approver: approver,
        summaries: summaries,
    });

    const headers = [
        "Select",
        "DV No.",
        "Name",
        "Address",
        "Particulars",
        "Mode",
        "Remarks",
        "Amount",
        "Tax",
        "Actions"
    ];

    function handleRowSelection(id: string, selected: boolean) {
        if (selected) {
            selectedRowIds.add(id);
        } else {
            selectedRowIds.delete(id);
        }
        selectedRowIds = new Set(selectedRowIds); // Trigger reactivity
    }

    function handleSelectAll(selected: boolean) {
        if (selected) {
            selectedRowIds = new Set($rows.map(row => row.id));
        } else {
            selectedRowIds = new Set();
        }
    }

    let allSelected = $derived(selectedRowIds.size > 0 && selectedRowIds.size === $rows.length);
    let someSelected = $derived(selectedRowIds.size > 0 && selectedRowIds.size < $rows.length);

    function addRow() {      
        let row: VoucherEntry = generateRandomVoucherData();
        row.id = crypto.randomUUID();
        $rows = [...$rows, row];
    }

    function generateSelectedVouchers() {
    const selectedRows = $rows.filter(row => selectedRowIds.has(row.id));
    selectedRows.forEach((row, index) => {
        const rowIndex = $rows.findIndex(r => r.id === row.id);
        let voucherIndex = summaries[selectedProject] + rowIndex + 1;
        let dv_no = `${selectedProject}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`;
        const data = {
            name: row.name,
            address: row.address,
            particulars: row.particulars,
            dv_no: dv_no,
            project_name: selectedProject,
            mode: row.mode,
            remarks: row.remarks,
            amount: row.amount,
            tax: row.tax,
            apply_tax: row.apply_tax, 
            total: row.amount - (row.apply_tax === 10 ? 0.01 * row.tax * row.amount : 0),
            authorized_rep: authorizedRep,
            approver: approver,
            date: Date.now().toString(),
        };
        generateVoucher(data);
    });
  }

    function generateAllVouchers() {
        $rows.forEach((row, index) => {
            let voucherIndex = summaries[selectedProject] + index + 1;
            let dv_no = `${selectedProject}-${((new Date()).getFullYear()).toString().slice(-2)}-${padZeroes(3, voucherIndex)}`;
            const data = {
                name: row.name,
                address: row.address,
                particulars: row.particulars,
                dv_no: dv_no,
                project_name: selectedProject,
                mode: row.mode,
                remarks: row.remarks,
                amount: row.amount,
                tax: row.tax,
                apply_tax: row.apply_tax, 
                total: row.amount - (row.apply_tax === 10 ? 0.01 * row.tax * row.amount : 0),
                authorized_rep: authorizedRep,
                approver: approver,
                date: Date.now().toString(),
            };
            generateVoucher(data);
        });
    }

    function deleteSelected() {
        if (confirm(`Are you sure you want to delete ${selectedRowIds.size} selected rows?`)) {
            $rows = $rows.filter(row => !selectedRowIds.has(row.id));
            selectedRowIds = new Set();
        }
    }

    function saveAllVouchers() {
        // Implementation for saving all vouchers
    }

    let projects: string[] = $state([]);

    async function loadProjects() {
        $projectsLoading = true;
        const { data } = await supabase
            .from("project_summaries")
            .select();

        projects = (data ?? []).map(item => item.code);
        summaries = Object.fromEntries(
            (data ?? []).map(item => [item.code, item.total_vouchers])
        );

        selectedProject = projects.length == 0 ? "" : projects[0];
        $projectsLoading = false;
    }

    onMount(async () => {
        await loadProjects();
    });
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
                <select bind:value={selectedProject} id="countries" class="bg-primary/10 text-sm rounded-lg border-2 border-primary hover:bg-primary/20 appearance:none font-bold py-2.5 px-2">
                    {#each projects as project}
                        <option value={project} selected>{project}</option>
                    {/each}
                </select>
            {/if}
        </div>
        <div class="py-3 text-black/30">•</div>
        <div>
            <button
                type="button"
                class="border text-white bg-green-800 hover:bg-green-900 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                onclick={addRow}
            >
                Add Row
            </button>
        </div>
        {#if selectedRowIds.size > 0}
            <div class="py-3 text-black/30">•</div>
            <div class="flex gap-2">
                <button
                    type="button"
                    class="border text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2.5"
                    onclick={generateSelectedVouchers}
                >
                    Save Selected as PDF ({selectedRowIds.size})
                </button>
                <button
                    type="button"
                    class="border text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2.5"
                    onclick={deleteSelected}
                >
                    Delete Selected ({selectedRowIds.size})
                </button>
            </div>
        {/if}
    </div>
    <div class="flex gap-1">
        <button
            type="button"
            class="border text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onclick={saveAllVouchers}
        >
            Save all
        </button>
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
        <span class="font-medium text-sm mb-2">Authorized representative: </span> 
        <input bind:value={authorizedRep} class="border-b border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2" type="text">
    </div>
    <div class="text-black/30">•</div>
    <div class="flex justify-start gap-2">
        <span class="font-medium text-sm">Approver: </span> 
        <input bind:value={approver} class="border-b border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2" type="text">
    </div>
</div>

<div class="relative overflow-x-auto border border-black/15 shadow-sm">
    <table class="w-full text-sm text-left rtl:text-right text-black">
        <thead class="text-xs text-white bg-primary">
            <tr>
                <th scope="col" class="px-3 py-3 w-[50px]">
                    <input 
                        type="checkbox" 
                        checked={allSelected}
                        indeterminate={someSelected}
                        onchange={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    >
                </th>
                {#each headers.slice(1) as header} 
                    <th scope="col" class="px-3 py-3">{header}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each $rows as row, index (row.id)}
                <Row 
                    {row} 
                    {index} 
                    {commonInfo}
                    isSelected={selectedRowIds.has(row.id)}
                    onSelectionChange={handleRowSelection}
                    editingRowId={editingRowId}
                    setEditingRowId={(id) => editingRowId = id}
                />
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