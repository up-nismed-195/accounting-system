<script>
    import { page } from '$app/stores';
    import { table_data } from '../data.svelte';
    import { goto } from '$app/navigation';

    let idx = +$page.params.id;
    let voucher = $table_data.rows[idx];

    function updateField(key, value) {
        $table_data.rows = $table_data.rows.map((row, i) =>
            i === idx ? { ...row, [key]: value } : row
        );
    }

    function confirmAndBack() {
        // Optionally, you could show a toast or do validation here
        goto('/vouchers');
    }
</script>

{#if voucher}
<div class="voucher-detail-card">
    <div class="voucher-header">
        <div>
            <h1>Voucher Details</h1>
            <div class="voucher-id">{voucher["Project"]}-{voucher["Date"]}-{voucher["No."]}</div>
        </div>
        <button class="confirm-btn" on:click={confirmAndBack}>
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Confirm
        </button>
    </div>
    <div class="voucher-fields">
        {#each Object.keys(voucher) as key}
            <div class="form-row">
                <label>{key}</label>
                {#if key === "Apply Tax"}
                    <input type="checkbox" checked={voucher[key]} on:change={e => updateField(key, e.target.checked)} />
                {:else if key === "Particulars" || key === "Remarks" || key === "Address"}
                    <textarea bind:value={voucher[key]} on:input={e => updateField(key, e.target.value)} />
                {:else if key === "Date"}
                    <input type="date" bind:value={voucher[key]} on:input={e => updateField(key, e.target.value)} />
                {:else if key === "Mode"}
                    <select bind:value={voucher[key]} on:change={e => updateField(key, e.target.value)}>
                        <option value="">Select Payment Mode</option>
                        <option value="Cash">Cash</option>
                        <option value="Check">Check</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Other">Other</option>
                    </select>
                {:else if key === "Amount"}
                    <input type="number" bind:value={voucher[key]} on:input={e => updateField(key, e.target.value)} />
                {:else}
                    <input type="text" bind:value={voucher[key]} on:input={e => updateField(key, e.target.value)} />
                {/if}
            </div>
        {/each}
    </div>
</div>
{:else}
    <div style="padding:2rem;text-align:center;">Voucher not found.</div>
{/if}

<style>
.voucher-detail-card {
    background: #fff;
    border-radius: 18px;
    padding: 2.5rem 2.5rem 2rem 2.5rem;
    max-width: 650px;
    margin: 2.5rem auto;
    box-shadow: 0 4px 24px 0 rgba(59,130,246,0.08), 0 1.5px 6px 0 rgba(34,197,94,0.06);
    display: flex;
    flex-direction: column;
    gap: 2rem;
    border: 1.5px solid #e0e7ef;
}

.voucher-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 1.2rem;
    margin-bottom: 1.2rem;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 2;
}

.voucher-header h1 {
    font-size: 1.7rem;
    font-weight: 700;
    color: #2563eb;
    margin: 0 0 0.2rem 0;
}

.voucher-id {
    font-size: 1.05rem;
    color: #64748b;
    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
    letter-spacing: 0.5px;
    margin-top: 0.2rem;
}

.confirm-btn {
    display: flex;
    align-items: center;
    background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
    color: #fff;
    font-weight: 700;
    font-size: 1.1rem;
    padding: 0.7rem 1.7rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(34,197,94,0.08);
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    outline: none;
}
.confirm-btn:hover {
    background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
    transform: translateY(-2px) scale(1.03);
}

.voucher-fields {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.form-row {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

label {
    font-weight: 600;
    color: #334155;
    font-size: 1.05rem;
    margin-bottom: 0.1rem;
}

input[type="text"], input[type="number"], input[type="date"], select, textarea {
    padding: 0.8rem 1.1rem;
    border-radius: 7px;
    border: 1.5px solid #d1d5db;
    font-size: 1.05rem;
    background: #f8fafc;
    transition: border 0.15s;
}
input[type="text"]:focus, input[type="number"]:focus, input[type="date"]:focus, select:focus, textarea:focus {
    border-color: #2563eb;
    outline: none;
}
textarea {
    min-height: 70px;
    resize: vertical;
}
input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #22c55e;
    margin-top: 0.3rem;
}
</style>