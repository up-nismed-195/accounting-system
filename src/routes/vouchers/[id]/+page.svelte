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
        goto('/vouchers');
    }
</script>

{#if voucher}
<div class="voucher-detail-card">
    <div class="voucher-header">
        <div class="header-content">
            <h1>Voucher Details</h1>
            <div class="voucher-id">{voucher["Project"]}-{voucher["Date"]}-{voucher["No."]}</div>
            <div class="accent-line"></div>
        </div>
        <button class="confirm-btn" on:click={confirmAndBack}>
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:8px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Confirm & Save
        </button>
    </div>
    <div class="voucher-fields">
        {#each Object.keys(voucher) as key}
            <div class="form-row" class:checkbox-row={key === "Apply Tax"}>
                <label for={key}>{key}</label>
                {#if key === "Apply Tax"}
                    <div class="checkbox-wrapper">
                        <input 
                            type="checkbox" 
                            id={key}
                            checked={voucher[key]} 
                            on:change={e => updateField(key, e.target.checked)} 
                        />
                        <span class="checkbox-label">Enable tax application</span>
                    </div>
                {:else if key === "Particulars" || key === "Remarks" || key === "Address"}
                    <textarea 
                        id={key}
                        bind:value={voucher[key]} 
                        on:input={e => updateField(key, e.target.value)}
                        placeholder="Enter {key.toLowerCase()}..."
                    />
                {:else if key === "Date"}
                    <input 
                        type="date" 
                        id={key}
                        bind:value={voucher[key]} 
                        on:input={e => updateField(key, e.target.value)} 
                    />
                {:else if key === "Mode"}
                    <select 
                        id={key}
                        bind:value={voucher[key]} 
                        on:change={e => updateField(key, e.target.value)}
                    >
                        <option value="">Select Payment Mode</option>
                        <option value="Cash">Cash</option>
                        <option value="Check">Check</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Other">Other</option>
                    </select>
                {:else if key === "Amount"}
                    <div class="amount-input">
                        <span class="currency">₱</span>
                        <input 
                            type="number" 
                            id={key}
                            bind:value={voucher[key]} 
                            on:input={e => updateField(key, e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                {:else}
                    <input 
                        type="text" 
                        id={key}
                        bind:value={voucher[key]} 
                        on:input={e => updateField(key, e.target.value)}
                        placeholder="Enter {key.toLowerCase()}..."
                    />
                {/if}
            </div>
        {/each}
    </div>
</div>
{:else}
    <div class="not-found">
        <div class="not-found-icon">📄</div>
        <h2>Voucher Not Found</h2>
        <p>The requested voucher could not be located.</p>
        <button on:click={() => goto('/vouchers')} class="back-btn">
            ← Back to Vouchers
        </button>
    </div>
{/if}

<style>
.voucher-detail-card {
    background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
    border: 2px solid #d1fae5;
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 750px;
    margin: 2.5rem auto;
    box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05), 0 0 0 1px rgba(16, 185, 129, 0.05);
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    position: relative;
    overflow: hidden;
}
.voucher-detail-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #10b981, #059669, #047857, #065f46);
}
.voucher-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #d1fae5;
    padding-bottom: 1.5rem;
    position: sticky;
    top: 0;
    background: inherit;
    z-index: 2;
    backdrop-filter: blur(10px);
}
.header-content {
    flex: 1;
}
.voucher-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #065f46;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 1px 2px rgba(16, 185, 129, 0.1);
}
.voucher-id {
    font-size: 1.1rem;
    color: #047857;
    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
    letter-spacing: 0.5px;
    margin-bottom: 0.75rem;
    background: rgba(16, 185, 129, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    display: inline-block;
    border: 1px solid #a7f3d0;
}
.accent-line {
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, #10b981, #34d399);
    border-radius: 2px;
    margin-top: 0.5rem;
}
.confirm-btn {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    font-weight: 700;
    font-size: 1.1rem;
    padding: 1rem 2rem;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    outline: none;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.confirm-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15);
}
.confirm-btn:active {
    transform: translateY(0);
}
.voucher-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}
.form-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.form-row.checkbox-row {
    grid-column: 1 / -1;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
}
label {
    font-weight: 600;
    color: #064e3b;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
}
input[type="text"], 
input[type="number"], 
input[type="date"], 
select, 
textarea {
    padding: 1rem 1.25rem;
    border-radius: 10px;
    border: 2px solid #d1fae5;
    font-size: 1rem;
    background: #ffffff;
    transition: all 0.2s ease;
    font-family: inherit;
}
input:focus, 
select:focus, 
textarea:focus {
    border-color: #10b981;
    outline: none;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
    background: #f0fdf4;
}
input:hover, 
select:hover, 
textarea:hover {
    border-color: #a7f3d0;
}
textarea {
    min-height: 90px;
    resize: vertical;
    font-family: inherit;
}
textarea::placeholder,
input::placeholder {
    color: #6b7280;
    font-style: italic;
}
select {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2310b981' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 1rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 3rem;
    appearance: none;
}
.amount-input {
    position: relative;
    display: flex;
    align-items: center;
}
.currency {
    position: absolute;
    left: 1.25rem;
    color: #059669;
    font-weight: 700;
    font-size: 1.1rem;
    z-index: 1;
    pointer-events: none;
}
.amount-input input {
    padding-left: 2.5rem;
}
.checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 2rem;
    background: rgba(16, 185, 129, 0.05);
    border: 2px solid #d1fae5;
    border-radius: 12px;
    transition: all 0.2s ease;
    cursor: pointer;
}
.checkbox-wrapper:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: #a7f3d0;
}
input[type="checkbox"] {
    width: 1.5rem;
    height: 1.5rem;
    margin: 0;
    padding: 0;
    border: 2px solid #10b981;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
    position: relative;
    appearance: none;
    transition: all 0.2s ease;
}
input[type="checkbox"]:checked {
    background: #10b981;
    border-color: #059669;
}
input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 1rem;
    font-weight: bold;
}
.checkbox-label {
    color: #065f46;
    font-weight: 600;
    font-size: 1rem;
    text-transform: none;
    letter-spacing: normal;
    margin: 0;
    cursor: pointer;
}
.not-found {
    text-align: center;
    padding: 4rem 2rem;
    max-width: 500px;
    margin: 4rem auto;
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    border: 2px solid #fecaca;
    border-radius: 20px;
    box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.1);
}
.not-found-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.7;
}
.not-found h2 {
    color: #dc2626;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
}
.not-found p {
    color: #6b7280;
    margin: 0 0 2rem 0;
    font-size: 1.1rem;
}
.back-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}
.back-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
}
@media (max-width: 768px) {
    .voucher-detail-card {
        margin: 1rem;
        padding: 1.5rem;
    }
    .voucher-fields {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }
    .voucher-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    .voucher-header h1 {
        font-size: 1.5rem;
    }
    .confirm-btn {
        justify-content: center;
    }
    .not-found {
        margin: 2rem 1rem;
        padding: 2rem 1rem;
    }
}
.form-row:has(textarea) {
    grid-column: 1 / -1;
}
</style>