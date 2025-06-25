<script>
    import Row from "./Row.svelte";
    import { table_data } from "./data.svelte";
    import { goto } from '$app/navigation';
    import { generateVoucher } from "./voucherGenerator.js";

    // Updated headers (no Gross)
    const headers = [
        "DV No.", "Date", "Payee", "Amount", "Particular", "Remarks", "Address"
    ];

    let selectedRows = [];
    let openMenuIndex = null;

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
</script>

<div class="button-bar">
    <button on:click={addVoucher} class="main-btn add-btn">
        New
    </button>
    <button
        class="main-btn generate-btn"
        on:click={generateSelectedPDFs}
        disabled={selectedRows.length === 0}
    >
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;" viewBox="0 0 24 24">
            <path d="M12 16v-8M8 12l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="4" y="4" width="16" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Generate Vouchers
    </button>
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
            {#each $table_data.rows as row, i (i)}
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
.button-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}
.main-btn {
    font-weight: 700;
    font-size: 1rem;
    padding: 0.7rem 1.7rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    outline: none;
    text-transform: capitalize;
}
.add-btn {
    background: #10b981;
    color: #fff;
}
.add-btn:hover {
    background: #059669;
    transform: translateY(-2px) scale(1.03);
}
.generate-btn {
    background: #2563eb;
    color: #fff;
    display: flex;
    align-items: center;
    font-weight: 700;
    gap: 0.5rem;
}
.generate-btn:disabled {
    background: #a5b4fc;
    color: #e0e7ff;
    cursor: not-allowed;
    opacity: 0.7;
}
.generate-btn:not(:disabled):hover {
    background: #1d4ed8;
    transform: translateY(-2px) scale(1.03);
}
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
}
.header-cell {
    background: #f1f5f9;
    color: #334155;
    font-weight: 700;
    padding: 14px 18px;
    border-bottom: 2px solid #e5e7eb;
    text-align: left;
    font-size: 1rem;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    z-index: 1;
}
</style>