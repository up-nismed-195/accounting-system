<script>
    import { page } from '$app/stores';
    import { table_data } from '../data.svelte';
    import { onMount } from 'svelte';

    let idx;
    let voucher = {};

    $: idx = +$page.params.id;
    $: voucher = $table_data.rows[idx] || {};

    function updateField(key, value) {
        $table_data.rows = $table_data.rows.map((row, i) =>
            i === idx ? { ...row, [key]: value } : row
        );
    }
</script>

<div class="voucher-detail">
    <h2>Voucher Details</h2>
    <div class="form-row">
        <label>Project</label>
        <input type="text" bind:value={voucher.Project} on:input={e => updateField('Project', e.target.value)} />
    </div>
    <div class="form-row">
        <label>Date</label>
        <input type="date" bind:value={voucher.Date} on:input={e => updateField('Date', e.target.value)} />
    </div>
    <div class="form-row">
        <label>DV No.</label>
        <input type="text" bind:value={voucher['DV No.']} on:input={e => updateField('DV No.', e.target.value)} />
    </div>
    <div class="form-row">
        <label>Payee</label>
        <input type="text" bind:value={voucher.Payee} on:input={e => updateField('Payee', e.target.value)} />
    </div>
    <div class="form-row">
        <label>Amount</label>
        <input type="number" bind:value={voucher.Amount} on:input={e => updateField('Amount', e.target.value)} />
    </div>
    <div class="form-row">
        <label>Payment Mode</label>
        <select bind:value={voucher.Mode} on:change={e => updateField('Mode', e.target.value)}>
            <option value="">Select Payment Mode</option>
            <option value="Cash">Cash</option>
            <option value="Check">Check</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
        </select>
    </div>
    <div class="form-row">
        <label>Particulars</label>
        <textarea bind:value={voucher.Particulars} on:input={e => updateField('Particulars', e.target.value)}></textarea>
    </div>
    <div class="form-row">
        <label>Remarks</label>
        <textarea bind:value={voucher.Remarks} on:input={e => updateField('Remarks', e.target.value)}></textarea>
    </div>
    <div class="form-row">
        <label>Address</label>
        <textarea bind:value={voucher.Address} on:input={e => updateField('Address', e.target.value)}></textarea>
    </div>
    <div class="form-row">
        <label>Authorized Rep</label>
        <input type="text" bind:value={voucher['Authorized Rep']} on:input={e => updateField('Authorized Rep', e.target.value)} />
    </div>
    <div class="form-row">
        <label>Approver</label>
        <input type="text" bind:value={voucher.Approver} on:input={e => updateField('Approver', e.target.value)} />
    </div>
    <div class="form-row">
        <label>Apply Tax</label>
        <input type="checkbox" checked={voucher['Apply Tax']} on:change={e => updateField('Apply Tax', e.target.checked)} />
    </div>
</div>

<style>
.voucher-detail {
    background: #fff;
    border-radius: 12px;
    padding: 2rem 2.5rem;
    max-width: 600px;
    margin: 2rem auto;
    box-shadow: 0 2px 8px rgba(59,130,246,0.04);
}
h2 {
    margin-bottom: 1.5rem;
    color: #2563eb;
}
.form-row {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.2rem;
}
label {
    font-weight: 600;
    margin-bottom: 0.4rem;
    color: #334155;
}
input, select, textarea {
    padding: 0.7rem 1rem;
    border-radius: 7px;
    border: 1px solid #d1d5db;
    font-size: 1rem;
    background: #f8fafc;
}
textarea {
    min-height: 60px;
}
</style>