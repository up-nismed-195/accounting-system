<script>
    import Row from "./Row.svelte";
    import { table_data } from "./data.svelte";
    import { goto } from '$app/navigation';
    import { generateVoucher } from "./voucherGenerator.js";

    const headers = [
        "DV No.", "Date", "Payee", "Amount", "Particular", "Remarks", "Address"
    ];

    let selectedRows = [];
    let openMenuIndex = null;

    // --- Sorting State ---
    let sortBy = "DV No.";
    let sortOrder = "asc";

    function setOpenMenu(idx) {
        openMenuIndex = idx;
    }

    function addVoucher() {
        let toAdd = {
            "Project": '',
            "Date": '', 
            "DV No.": '', 
            "Payee": '', 
            "Amount": '',
            "Mode": '',   
            "Particulars": '', 
            "Remarks": '', 
            "Address": '',
            "Authorized Rep": '',
            "Approver": '',
            "Apply Tax": false,
        };
        $table_data.rows = [...$table_data.rows, toAdd];
        goto(`/vouchers/${$table_data.rows.length - 1}`);
    }

    function handleSelectRow(idx) {
        if (selectedRows.includes(idx)) {
            selectedRows = selectedRows.filter(i => i !== idx);
        } else {
            selectedRows = [...selectedRows, idx];
        }
    }

    function generateSelectedPDFs() {
        selectedRows.forEach(idx => {
            const row = $table_data.rows[idx];
            if (!row) return;
            const converted = {
                payee: row["Payee"]?.toString() ?? "",
                address: row["Address"]?.toString() ?? "",
                dv_no: row["DV No."] ?? "",
                mode: row["Mode"]?.toString() ?? "",
                charge: row["Amount"]?.toString() ?? "",
                particulars: row["Particulars"]?.toString() ?? "",
                authorized_rep: row["Authorized Rep"]?.toString() ?? "",
                approver: row["Approver"]?.toString() ?? "",
                amount: parseInt(row["Amount"]),
                apply_tax: !!row["Apply Tax"]
            };
            generateVoucher(converted);
        });
    }

    // --- Sorting Logic ---
    $: sortedRows = [...$table_data.rows].sort((a, b) => {
        let aVal, bVal;
        if (sortBy === "Payee") {
            aVal = (a["Payee"] || "").toLowerCase();
            bVal = (b["Payee"] || "").toLowerCase();
        } else {
            // "DV No."
            aVal = (a["DV No."] || "").toString();
            bVal = (b["DV No."] || "").toString();
        }
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });
</script>

<!-- HEADER -->

<div class="flex justify-between items-center gap-5">
    <div class="flex items-center gap-5">
        <h1 class="text-3xl font-semibold">
            Vouchers
        </h1>
        <div class="flex gap-2 items-center">
            <label for="sortBy" class="font-medium text-green-900">Sort by:</label>
            <select id="sortBy" bind:value={sortBy} class="rounded-lg border border-green-300 px-2 py-1 text-sm">
                <option value="DV No.">No.</option>
                <option value="Payee">Payee</option>
            </select>
            <button class="border rounded px-2 py-1 text-green-900 bg-green-50 hover:bg-green-100"
                on:click={() => sortOrder = sortOrder === "asc" ? "desc" : "asc"}>
                {sortOrder === "asc" ? "▲" : "▼"}
            </button>
        </div>
    </div>
    <div class="flex gap-3">
        <button on:click={addVoucher} class="border text-white bg-emerald-600 hover:bg-emerald-700 font-medium rounded-lg text-sm px-5 py-2.5">
            New Voucher
        </button>
        <button
            class="border text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2"
            on:click={generateSelectedPDFs}
            disabled={selectedRows.length === 0}
        >
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:2px;" viewBox="0 0 24 24">
                <path d="M12 16v-8M8 12l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="4" y="4" width="16" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Generate Vouchers
        </button>
    </div>
</div>

<div class="table-scroll">
    <table class="wide-table">
        <thead>
            <tr>
                <th class="header-cell"></th>
                {#each headers as header} 
                    <th class="header-cell">{header}</th>
                {/each}
                <th class="header-cell" style="width:60px"></th>
            </tr>
        </thead>
        <tbody>
            {#each sortedRows as row, i (i)}
                <Row
                    {row}
                    {i}
                    selected={selectedRows.includes(i)}
                    onSelectRow={() => handleSelectRow(i)}
                    openMenuIndex={openMenuIndex}
                    setOpenMenu={setOpenMenu}
                />
            {/each}
        </tbody>
    </table>
</div>

<style>
.table-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    background: #f8fafc;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(59,130,246,0.04);
    padding-bottom: 1rem;
}
.wide-table {
    min-width: 1000px; 
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(16, 185, 129, 0.07);
    font-size: 0.93rem;
}
.header-cell {
    background: #166534;
    color: #fff;
    font-weight: 700;
    padding: 10px 14px;
    border-bottom: none;
    text-align: left;
    font-size: 0.97rem;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 1;
}
.wide-table th, .wide-table td {
    border-right: none;
}
.wide-table th:last-child, .wide-table td:last-child {
    border-right: none;
}
.wide-table tr {
    border-bottom: none;
    background: #fff;
    transition: background-color 0.15s;
}
.wide-table tr:hover {
    background-color: #f0fdf4;
}
.data-cell, .id-cell, .select-cell, .action-cell {
    padding: 9px 12px;
    vertical-align: middle;
    font-size: 0.93rem;
    color: #111827;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.id-cell {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    font-weight: 600;
    border-radius: 8px;
    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 90px;
}
.select-cell {
    width: 40px;
    text-align: center;
}
.action-cell {
    min-width: 60px;
    width: 60px;
    padding: 8px 8px;
    vertical-align: middle;
    position: relative;
}
</style>