<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from "$lib/supabaseClient";

  // Project selection
  let projects: { id: string, code: string, title: string }[] = [];
  let selectedProjectId: string = '';

  // Editable voucher rows
  let voucherRows: (voucher & { name?: string, address?: string })[] = [];

  // Helper for today's date
  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  // Load projects for dropdown
  async function load_projects() {
    const { data, error } = await supabase.from('projects').select('id, code, title');
    projects = data ?? [];
    if (projects.length > 0) selectedProjectId = projects[0].id;
  }

  // Add a new empty row
  function addRow() {
    voucherRows = [
      ...voucherRows,
      {
        dv_no: '',
        payee_id: '',
        name: '',
        address: '',
        project_id: selectedProjectId,
        date: today(),
        gross: 0,
        has_tax_deduction: false,
        particulars: '',
        payment_mode: '',
        remarks: ''
      }
    ];
  }

  // Save a single voucher row
  async function saveVoucherRow(row: any, idx: number) {
    // Only send the correct fields
    const { name, address, ...voucherData } = row;
    try {
      const { error } = await supabase.from('vouchers').insert(voucherData);
      if (error) throw error;
      alert('Voucher saved!');
    } catch (e) {
      alert('Error saving voucher');
    }
  }

  // Save all voucher rows
  async function saveAllVouchers() {
    try {
      const rows = voucherRows.map(({ name, address, ...voucherData }) => voucherData);
      const { error } = await supabase.from('vouchers').insert(rows);
      if (error) throw error;
      alert('All vouchers saved!');
      voucherRows = [];
    } catch (e) {
      alert('Error saving vouchers');
    }
  }

  // Update a field in a row
  function updateRow(idx: number, key: string, value: any) {
    voucherRows = voucherRows.map((row, i) =>
      i === idx ? { ...row, [key]: value } : row
    );
  }

  // Delete a row from the table
  function deleteRow(idx: number) {
    voucherRows = voucherRows.filter((_, i) => i !== idx);
  }

  onMount(async () => {
    await load_projects();
    addRow();
  });
</script>

<div class="page-header">
  <h1 class="page-title">Add Vouchers</h1>
  <div class="header-actions">
    <select class="project-select" bind:value={selectedProjectId} on:change={() => voucherRows.forEach((row, i) => updateRow(i, 'project_id', selectedProjectId))}>
      {#each projects as p}
        <option value={p.id}>{p.code}</option>
      {/each}
    </select>

    <span class="text-gray-600/70">|</span>
    <button class="save-all-btn bg-blue-500 hover:bg-blue-700" on:click={saveAllVouchers}>Save All</button>
  </div>
</div>

<table class="voucher-table border-2 border-green-800">
  <thead>
    <tr>
      <th>DV No.</th>
      <th>Name</th>
      <th>Address</th>
      <th>Date</th>
      <th>Gross (PHP)</th>
      <th>Tax</th>
      <th>Particulars</th>
      <th>Mode</th>
      <th>Remarks</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each voucherRows as row, idx}
      <tr>
        <td><input type="text" value={row.dv_no} on:input={e => updateRow(idx, 'dv_no', e.target.value)} /></td>
        <td><input type="text" value={row.name} on:input={e => updateRow(idx, 'name', e.target.value)} /></td>
        <td><input type="text" value={row.address} on:input={e => updateRow(idx, 'address', e.target.value)} /></td>
        <td><input type="date" value={row.date} on:input={e => updateRow(idx, 'date', e.target.value)} /></td>
        <td><input type="number" min="0" step="1000" value={row.gross} on:input={e => updateRow(idx, 'gross', +e.target.value)} /></td>
        <td><input type="checkbox" checked={row.has_tax_deduction} on:change={e => updateRow(idx, 'has_tax_deduction', e.target.checked)} /></td>
        <td><input type="text" value={row.particulars} on:input={e => updateRow(idx, 'particulars', e.target.value)} /></td>
        <td>
          <select value={row.payment_mode} on:change={e => updateRow(idx, 'payment_mode', e.target.value)} class="mode-select">
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="Online Payment">Online Payment</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </td>
        <td><input type="text" value={row.remarks} on:input={e => updateRow(idx, 'remarks', e.target.value)} /></td>
        <td class="space-x-1">
          <button class="text-blue-500 hover:underline" on:click={() => saveVoucherRow(row, idx)}>Save</button>
          <button class="text-red-500 hover:underline" on:click={() => deleteRow(idx)}>Delete</button>
        </td>
      </tr>
    {/each}
    <tr>
      <td colspan="10" style="text-align:center;">
        <button class="add-row-btn" on:click={addRow}>+ Add Row</button>
      </td>
    </tr>
  </tbody>
</table>

<style>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: oklch(44.8% 0.119 151.328); /* deep green */
  letter-spacing: -0.5px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.project-select {
  background: oklch(98% 0.01 151.328); /* very light green, almost white */
  color: #1a3a1a; /* dark green text */
  font-size: 1rem;
  font-weight: 500;
  border: 2px solid oklch(44.8% 0.119 151.328);
  border-radius: 0.4rem;
  padding: 0rem 1.0rem;
  box-shadow: 0 1px 4px 0 rgba(44, 62, 80, 0.04);
  outline: none;
  transition: background 0.15s, border 0.15s;
  height: 2.5rem;
}
.project-select:focus {
  background: oklch(94% 0.01 151.328);
  border-color: oklch(34.389% 0.09873 148.331);
}

.mode-select {
  background: #f9fafb;
  color: #222;
  font-size: 0.92rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.3rem;
  padding: 0.15rem 0.3rem;
  width: 100%;
}

.add-row-btn, .save-btn {
  background: oklch(49.213% 0.13198 151.157); /* dark green */
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: background 0.15s;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.save-all-btn {
  /* background: oklch(36.125% 0.02679 161.677);  */
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: background 0.15s;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}


.add-row-btn:hover, .save-btn:hover {
  background: oklch(43.25% 0.12662 147.579);
}

.delete-btn {
  background: #e11d48;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.7rem 1.1rem;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  margin-left: 0.4rem;
  transition: background 0.15s;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.delete-btn:hover {
  background: #be123c;
}

.voucher-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
  font-size: 0.78rem;
  table-layout: fixed;
}

/* Set different column widths for different data types */
.voucher-table th:nth-child(1), /* DV No. */
.voucher-table td:nth-child(1) {
  width: 15%;
}
.voucher-table th:nth-child(2), /* Name */
.voucher-table td:nth-child(2) {
  width: 13%;
}
.voucher-table th:nth-child(3), /* Address */
.voucher-table td:nth-child(3) {
  width: 18%;
}
.voucher-table th:nth-child(4), /* Date */
.voucher-table td:nth-child(4) {
  width: 10%;
}
.voucher-table th:nth-child(5), /* Gross */
.voucher-table td:nth-child(5) {
  width: 10%;
}
.voucher-table th:nth-child(6), /* Tax */
.voucher-table td:nth-child(6) {
  width: 6%;
}
.voucher-table th:nth-child(7), /* Particulars */
.voucher-table td:nth-child(7) {
  width: 15%;
}
.voucher-table th:nth-child(8), /* Mode */
.voucher-table td:nth-child(8) {
  width: 10%;
}
.voucher-table th:nth-child(9), /* Remarks */
.voucher-table td:nth-child(9) {
  width: 15%;
}
.voucher-table th:nth-child(10), /* Actions */
.voucher-table td:nth-child(10) {
  width: 15%;
}

.voucher-table th, .voucher-table td {
  padding: 0.35rem 0.4rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.voucher-table th {
  background: oklch(44.8% 0.119 151.328); /* dark green */
  color: #fff;
  text-align: left;
}

.voucher-table td {
  background: #fff;
  color: #111;
  border-bottom: 1px solid #e5e5e5;
}

.voucher-table tr:last-child td {
  border-bottom: none;
}

.voucher-table input[type="text"],
.voucher-table input[type="number"],
.voucher-table input[type="date"] {
  width: 100%;
  font-size: 0.8rem;
  padding: 0.15rem 0.3rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.3rem;
  background: #f9fafb;
  box-sizing: border-box;
}

.voucher-table input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
}



@media (max-width: 900px) {
  .voucher-table, .voucher-table th, .voucher-table td {
    font-size: 0.7rem;
    padding: 0.15rem 0.15rem;
  }
  .page-title {
    font-size: 1.1rem;
  }
}

.save-btn, .delete-btn {
  width: 50px;
}

</style>
