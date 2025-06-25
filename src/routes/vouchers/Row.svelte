<script lang="ts">
    import { table_data } from './data.svelte.js';
    import { generateVoucher } from './voucherGenerator.js';
    import { goto } from '$app/navigation';

    export let row;
    export let i;
    export let selected = false;
    export let onSelectRow = () => {};

    // Props for controlling menu open state from parent
    export let openMenuIndex = null;
    export let setOpenMenu = (idx: number|null) => {};

    let menuStyle = "";
    let penBtn: HTMLButtonElement;

    // Only show menu if this row's index matches openMenuIndex
    $: showActions = openMenuIndex === i;

    function toggleActions(e) {
        e.stopPropagation();
        if (showActions) {
            setOpenMenu(null);
        } else {
            setOpenMenu(i);
            // Position menu to the left of the button
            if (penBtn) {
                const rect = penBtn.getBoundingClientRect();
                menuStyle = `
                    position: fixed;
                    left: ${rect.left - 180 - 8}px;
                    top: ${rect.top}px;
                    width: 180px;
                    z-index: 9999;
                `;
            }
        }
    }

    function handleWindowClick() {
        if (showActions) setOpenMenu(null);
    }

    function deleteRow() {
        $table_data.rows = [
            ...$table_data.rows.slice(0, i),
            ...$table_data.rows.slice(i + 1)
        ];
    }

    function toPDF() {
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
        }
        generateVoucher(converted)
    }

    function duplicateRow() {
        $table_data.rows = [
            ...$table_data.rows.slice(0, i + 1),
            { ...row },
            ...$table_data.rows.slice(i + 1)
        ];
    }
</script>

<svelte:window on:click={handleWindowClick} />

<tr class="table-row">
    <td class="select-cell">
        <input type="checkbox" checked={selected} on:change={onSelectRow} />
    </td>
    <td class="id-cell">{row["DV No."] || '-'}</td>
    <td class="data-cell">{row["Date"]}</td>
    <td class="data-cell">{row["Payee"]}</td>
    <td class="data-cell">{row["Amount"]}</td>
    <td class="data-cell">{row["Particulars"]}</td>
    <td class="data-cell">
        <input
            class="remarks-input"
            type="text"
            bind:value={row["Remarks"]}
            on:click|stopPropagation
        />
    </td>
    <td class="data-cell">{row["Address"]}</td>
    <td class="action-cell" style="position:relative;">
        <button class="pen-btn" bind:this={penBtn} on:click={toggleActions} title="Show actions">
            <svg class="pen-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
        </button>
    </td>
</tr>

{#if showActions}
    <div class="dropdown-menu floating-menu" style={menuStyle} on:click|stopPropagation>
        <button on:click={toPDF}>PDF</button>
        <button on:click={duplicateRow}>Duplicate</button>
        <button on:click={() => goto(`/vouchers/${i}`)}>Edit</button>
        <button on:click={deleteRow} class="danger">Delete</button>
    </div>
{/if}

<style>
    .select-cell {
        width: 40px;
        text-align: center;
    }
    .table-row {
        border-bottom: 1px solid #e5e7eb;
        transition: background-color 0.15s ease;
    }
    .table-row:hover {
        background-color: #f9fafb;
    }
    .id-cell {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        font-weight: 600;
        font-size: 1rem;
        padding: 10px 16px;
        text-align: center;
        border-radius: 8px;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(34, 197, 94, 0.15);
        border: none;
        font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
        min-width: 90px;
        vertical-align: middle;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        overflow-x: auto;
        max-width: 220px;
    }
    .data-cell {
        padding: 12px 16px;
        vertical-align: middle;
        min-width: 120px;
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .remarks-input {
        width: 100%;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 1rem;
        background: #fff;
        color: #374151;
    }
    .remarks-input:focus {
        outline: 2px solid #2563eb;
        border-color: #2563eb;
    }
    .action-cell {
        min-width: 60px;
        width: 60px;
        padding: 8px 8px;
        vertical-align: middle;
        position: relative;
    }
    .pen-btn {
        background: #f1f5f9;
        border: none;
        border-radius: 50%;
        padding: 7px;
        cursor: pointer;
        transition: background 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .pen-btn:hover {
        background: #dbeafe;
    }
    .pen-icon {
        width: 22px;
        height: 22px;
        color: #2563eb;
    }
    .dropdown-menu {
        background: #fff;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        min-width: 180px;
        max-width: 180px;
        width: 180px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        padding: 4px 0;
        animation: fadeIn 0.15s;
    }
    .floating-menu {
        /* Position is set inline */
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-8px);}
        to { opacity: 1; transform: translateY(0);}
    }
    .dropdown-menu button {
        background: none;
        border: none;
        padding: 12px 18px;
        text-align: left;
        font-size: 1rem;
        color: #374151;
        cursor: pointer;
        transition: background 0.12s;
        border-radius: 0;
        width: 100%;
        min-width: 100%;
        box-sizing: border-box;
    }
    .dropdown-menu button:hover {
        background: #f1f5f9;
    }
    .dropdown-menu .danger {
        color: #ef4444;
    }
</style>