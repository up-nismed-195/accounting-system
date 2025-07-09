<script lang="ts">
  // ===============
  // onMount actions
  // ===============
  import { show } from '$lib/helpers';
	import { onMount } from 'svelte';
  import { supabase } from "$lib/supabaseClient";

  let summaries: summary[] = []
  async function load_summaries() {
    try {
      const { data, error } = await supabase
      .from("summaries")
      .select();
      summaries = data ?? []
    } catch { 
      summaries = [] 
    } finally {
      // show(summaries)
    }
  }

  onMount(async () => {
    await load_summaries()
  })
</script>

<table class="summary-table">
  <thead>
    <tr>
      <th>Code</th>
      <th>Title</th>
      <th>Total Vouchers</th>
      <th>Gross Total</th>
      <th>Net Total</th>
    </tr>
  </thead>
  <tbody>
    {#each summaries as s}
      <tr>
        <td>{s.code}</td>
        <td>{s.title}</td>
        <td>{s.total_vouchers}</td>
        <td>{s.gross_total}</td>
        <td>{s.net_total}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
}
.summary-table th {
  background: #14532d; /* dark green */
  color: #fff;
  padding: 0.75rem 1rem;
  text-align: left;
}
.summary-table td {
  background: #fff;
  color: #111;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e5e5;
}
.summary-table tr:last-child td {
  border-bottom: none;
}
</style>


