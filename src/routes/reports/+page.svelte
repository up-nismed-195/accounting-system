<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from "$lib/supabaseClient";

  let vouchers: voucher[] = [];
  async function load_vouchers() {
    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select();
      if (error) throw error;
      vouchers = data ?? [];
    } catch (error) {
      vouchers = [];
      alert("Error loading vouchers");
    }
  }

  onMount(async () => {
    await load_vouchers();
  });
</script>

<div class="page-header">
  <h1 class="page-title">Personnel Services</h1>
</div>

<table class="voucher-table border-2 border-green-800">
  <thead>
    <tr>
      <th>DV No.</th>
      <th>Payee Name</th>
      <th>Project Code</th>
      <th>Date</th>
      <th>Nth Yearly Voucher</th>
      <th>Gross</th>
      <th>Has Tax Deduction</th>
      <th>Particulars</th>
      <th>Payment Mode</th>
      <th>Remarks</th>
    </tr>
  </thead>
  <tbody>
    {#each vouchers as v}
      <tr>
        <td>{v.dv_no}</td>
        <td>{v.payee_id}</td>
        <td>{v.project_id}</td>
        <td>{v.date}</td>
        <td>{v.nth_yearly_voucher}</td>
        <td>{v.gross}</td>
        <td>{v.has_tax_deduction ? 'Yes' : 'No'}</td>
        <td>{v.particulars}</td>
        <td>{v.payment_mode}</td>
        <td>{v.remarks}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
.page-header {
  display: flex;
  align-items: center;
  justify-content: start;
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

.voucher-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}
.voucher-table th {
  background: oklch(44.8% 0.119 151.328); /* dark green */
  color: #fff;
  padding: 0.75rem 1rem;
  text-align: left;
}
.voucher-table td {
  background: #fff;
  color: #111;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e5e5;
}
.voucher-table tr:last-child td {
  border-bottom: none;
}
</style>
