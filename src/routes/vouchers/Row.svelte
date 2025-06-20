<script lang="ts">
    import { table_data } from './data.svelte.js';
    import { generateVoucher } from './voucherGenerator.js';

    export let row;
    export let i;

    // Modal state
    let showModal = false;
    let modalKey = '';
    let modalValue = '';

    // helpers
    const keys = Object.keys(row);
    let dv_no = `${row['Project']}-${row['Date']}-${row['No.']}`;

    function deleteRow() {
        $table_data.rows = [
            ...$table_data.rows.slice(0, i),
            ...$table_data.rows.slice(i + 1)
        ];
    }

    function updateValue(key: string, value: any) {
        $table_data.rows = $table_data.rows.map((r, idx) =>
            idx === i ? { ...r, [key]: value } : r
        );
    }

    function toPDF() {
        const converted = {
            payee: row["Payee"]?.toString() ?? "",
            address: row["Address"]?.toString() ?? "",
            dv_no: dv_no,
            mode: row["Mode"]?.toString() ?? "",
            charge: row["Gross"]?.toString() ?? "",
            particulars: row["Particulars"]?.toString() ?? "",
            authorized_rep: row["Authorized Rep"]?.toString() ?? "",
            approver: row["Approver"]?.toString() ?? "",
            amount: parseInt(row["Amount"]),
            apply_tax: !!row["Apply Tax"]
        }
        generateVoucher(converted)
    }

    function openModal(key: string) {
        modalKey = key;
        modalValue = row[key];
        showModal = true;
    }

    function saveModal() {
        updateValue(modalKey, modalValue);
        showModal = false;
    }
</script>

<tr class="table-row">
    <td class="id-cell">{dv_no}</td>
    {#each keys as key}
        <td class="data-cell">
            {#if key === "Apply Tax"}
                <label class="checkbox-wrapper">
                    <input
                        type="checkbox"
                        class="checkbox-input"
                        checked={row[key]}
                        on:change={e => updateValue(key, e.target.checked)}
                    />
                    <span class="checkbox-custom"></span>
                </label>
            {:else if key === "Particulars" || key === "Address"}
                <button class="text-btn" on:click={() => openModal(key)}>
                    <span class="text-content">
                        {row[key] ? row[key].slice(0, 30) + (row[key].length > 30 ? '...' : '') : 'Click to edit'}
                    </span>
                    <svg class="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
            {:else if key === "Date"}
                <input
                    type="date"
                    class="text-input"
                    value={row[key]}
                    on:input={e => updateValue(key, e.target.value)}
                />
            {:else if key === "Mode"}
                <select
                    class="select-input"
                    value={row[key]}
                    on:change={e => updateValue(key, e.target.value)}
                >
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                </select>
            {:else}
                <input 
                    type="text" 
                    class="text-input"
                    value={row[key]}
                    on:input={e => updateValue(key, e.target.value)}
                    placeholder="Enter value"
                />
            {/if}
        </td>
    {/each}
    <td class="action-cell">
        <div class="action-buttons">
            <button on:click={toPDF} class="action-btn primary-btn" title="Generate PDF">
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                PDF
            </button>
            <button on:click={deleteRow} class="action-btn danger-btn" title="Delete row">
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
            </button>
        </div>
    </td>
</tr>

{#if showModal}
    <div class="modal-backdrop" on:click={() => showModal = false}>
        <div class="modal" on:click|stopPropagation>
            <div class="modal-header">
                <h3 class="modal-title">Edit {modalKey}</h3>
                <button class="modal-close" on:click={() => showModal = false}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <textarea 
                    bind:value={modalValue} 
                    rows="5" 
                    class="modal-textarea"
                    placeholder="Enter {modalKey.toLowerCase()}..."
                ></textarea>
            </div>
            <div class="modal-footer">
                <button class="modal-btn secondary-btn" on:click={() => showModal = false}>Cancel</button>
                <button class="modal-btn primary-btn" on:click={saveModal}>Save Changes</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .table-row {
        border-bottom: 1px solid #e5e7eb;
        transition: background-color 0.15s ease;
    }
    .table-row:hover {
        background-color: #f9fafb;
    }
    .id-cell {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        font-weight: 600;
        font-size: 1rem;
        padding: 18px 24px;
        text-align: center;
        border-radius: 8px;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
        border: none;
        font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
        min-width: 90px;
        vertical-align: middle;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .data-cell {
        padding: 12px 16px;
        vertical-align: middle;
        min-width: 140px;
    }
    .text-input, .select-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.875rem;
        transition: all 0.15s ease;
        background: white;
    }
    .text-input:focus, .select-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .text-input:hover, .select-input:hover {
        border-color: #9ca3af;
    }
    .text-btn {
        width: 100%;
        padding: 8px 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        text-align: left;
        font-size: 0.875rem;
        min-height: 36px;
    }
    .text-btn:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }
    .text-content {
        color: #475569;
        flex: 1;
        min-width: 0;
    }
    .edit-icon {
        width: 16px;
        height: 16px;
        color: #64748b;
        flex-shrink: 0;
        margin-left: 8px;
    }
    .checkbox-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
    }
    .checkbox-input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }
    .checkbox-custom {
        width: 18px;
        height: 18px;
        border: 2px solid #d1d5db;
        border-radius: 4px;
        background: white;
        transition: all 0.15s ease;
        position: relative;
    }
    .checkbox-input:checked + .checkbox-custom {
        background: #3b82f6;
        border-color: #3b82f6;
    }
    .checkbox-input:checked + .checkbox-custom::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
    }
    .checkbox-wrapper:hover .checkbox-custom {
        border-color: #9ca3af;
    }
    .action-cell {
        padding: 12px 16px;
        vertical-align: middle;
    }
    .action-buttons {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .action-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
    }
    .btn-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }
    .primary-btn {
        background: #3b82f6;
        color: white;
    }
    .primary-btn:hover {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.25);
    }
    .danger-btn {
        background: #ef4444;
        color: white;
    }
    .danger-btn:hover {
        background: #dc2626;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(239, 68, 68, 0.25);
    }
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
    }
    .modal {
        background: white;
        border-radius: 12px;
        min-width: 400px;
        max-width: 90vw;
        max-height: 90vh;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        overflow: hidden;
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 16px;
        border-bottom: 1px solid #e5e7eb;
    }
    .modal-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
    }
    .modal-close {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #6b7280;
        border-radius: 4px;
        transition: all 0.15s ease;
    }
    .modal-close:hover {
        background: #f3f4f6;
        color: #374151;
    }
    .modal-close svg {
        width: 20px;
        height: 20px;
    }
    .modal-body {
        padding: 20px 24px;
    }
    .modal-textarea {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.875rem;
        line-height: 1.5;
        resize: vertical;
        min-height: 120px;
        font-family: inherit;
        transition: all 0.15s ease;
    }
    .modal-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px 20px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
    }
    .modal-btn {
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
    }
    .modal-btn.secondary-btn {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
    }
    .modal-btn.secondary-btn:hover {
        background: #f9fafb;
        border-color: #9ca3af;
    }
    .modal-btn.primary-btn {
        background: #3b82f6;
        color: white;
    }
    .modal-btn.primary-btn:hover {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.25);
    }
</style>