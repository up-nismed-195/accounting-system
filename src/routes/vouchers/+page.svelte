<script>
    import Row from "./Row.svelte";
    import { table_data } from "./data.svelte";

    const headers = [
        "ID", "Project", "Date", "No.", "Payee", "Amount", "Mode",
        "Particulars", "Gross", "Remarks", "Address", "Authorized Rep", "Approver", 
        "Apply Tax", "Actions"
    ];

    const headerMap = {
        "ID": "ID",
        "Project": "Project",
        "Date": "Date",
        "No.": "No.",
        "Payee": "Payee",
        "Amount": "Amount",
        "Mode": "Payment Mode",
        "Particulars": "Particulars",
        "Gross": "Gross",
        "Remarks": "Remarks",
        "Address": "Address",
        "Authorized Rep": "Authorized Rep",
        "Approver": "Approver",
        "Apply Tax": "Apply Tax",
        "Actions": "Actions"
    };

    function addRow() {
        let toAdd = {
            "Project": '',
            "Date": '', 
            "No.": '', 
            "Payee": '', 
            "Amount": '',
            "Mode": '',   
            "Particulars": '', 
            "Gross": "",
            "Remarks": '', 
            "Address": '',
            "Authorized Rep": '',
            "Approver": '',
            "Apply Tax": false,
        };
        $table_data.rows = [...$table_data.rows, toAdd];
    }

    function generateVouchers() {
        console.log($table_data.rows);
    }    
</script>

<div class="button-bar">
    <button on:click={addRow} class="main-btn add-btn">
        Add Row
    </button>
    <button on:click={generateVouchers} class="main-btn gen-btn">
        Generate Vouchers
    </button>
</div>

<div class="table-scroll">
    <table class="wide-table">
        <thead>
            <tr>
                {#each headers as header} 
                    <th class="header-cell">{headerMap[header] ?? header}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each $table_data.rows as row, i (i)}
                <Row {row} {i} />
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
.gen-btn {
    background: #2563eb;
    color: #fff;
}
.gen-btn:hover {
    background: #1d4ed8;
    transform: translateY(-2px) scale(1.03);
}
.table-scroll {
    width: 100%;
    overflow-x: auto;
    background: #f8fafc;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(59,130,246,0.04);
    padding-bottom: 1rem;
}
.wide-table {
    min-width: 1400px;
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