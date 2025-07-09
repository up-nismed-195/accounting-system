<script lang="ts">
  import Spinner from "$lib/components/Spinner.svelte";
  import { projectsLoading } from "$lib/stores/stores";
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";

  let vouchers: any[] = $state([]);
  let filteredVouchers: any[] = $state([]);
  let dateFilter: string = $state('all');
  let customStartDate: string = $state('');
  let customEndDate: string = $state('');

  async function loadVouchers() {
    const { data, error } = await supabase
      .from("voucher")
      .select(`
        dv_no,
        payee_name,
        project_code,
        payment_mode,
        voucher_date,
        amount,
        authorized_representative,
        approver
      `)
      .order("voucher_date", { ascending: false });

    if (data) {
      vouchers = data;
      filterVouchers();
    }
    if (error) {
      console.error("Error loading vouchers:", error);
    }
  }

  function filterVouchers() {
    const now = new Date();
    let filtered = [...vouchers];

    switch (dateFilter) {
      case "today":
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = vouchers.filter(v => new Date(v.voucher_date) >= today);
        break;

      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = vouchers.filter(v => new Date(v.voucher_date) >= weekAgo);
        break;

      case "month":
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filtered = vouchers.filter(v => new Date(v.voucher_date) >= monthAgo);
        break;

      case "custom":
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          filtered = vouchers.filter(v => {
            const voucherDate = new Date(v.voucher_date);
            return voucherDate >= startDate && voucherDate <= endDate;
          });
        }
        break;

      case "all":
      default:
        filtered = vouchers;
        break;
    }

    filteredVouchers = filtered;
  }

  async function deleteVoucher(dv_no: string) {
    const confirmed = confirm(`Are you sure you want to delete voucher ${dv_no}?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("voucher")
      .delete()
      .eq("dv_no", dv_no);

    if (error) {
      alert("Error deleting voucher.");
      console.error("Delete error:", error);
      return;
    }

    vouchers = vouchers.filter(v => v.dv_no !== dv_no);
    filteredVouchers = filteredVouchers.filter(v => v.dv_no !== dv_no);

    alert(`Voucher ${dv_no} deleted.`);
  }

  $effect(() => {
    if (vouchers.length > 0) {
      filterVouchers();
    }
  });

  onMount(async () => {
    $projectsLoading = true;
    await loadVouchers();
    $projectsLoading = false;
  });
</script>

<!-- Header + Filters -->
<div class="flex justify-between items-start gap-5">
  <div class="flex flex-wrap gap-3 items-center">
    <h1 class="text-4xl font-semibold">History</h1>
    {#if $projectsLoading}
      <Spinner />
    {/if}

    <div class="flex gap-2 items-center">
      <span class="text-sm font-medium">Filter by date:</span>
      <select 
        bind:value={dateFilter}
        class="bg-white border border-gray-300 text-sm rounded-lg px-3 py-2"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>

    {#if dateFilter === 'custom'}
      <div class="flex gap-2 items-center">
        <input 
          type="date" 
          bind:value={customStartDate}
          class="border border-gray-300 text-sm rounded px-2 py-1"
        />
        <span class="text-sm">to</span>
        <input 
          type="date" 
          bind:value={customEndDate}
          class="border border-gray-300 text-sm rounded px-2 py-1"
        />
      </div>
    {/if}
  </div>
</div>

<!-- Results count -->
<div class="mt-2 text-sm text-gray-600">
  Showing {filteredVouchers.length} of {vouchers.length} vouchers
</div>

<!-- Vouchers Table -->
<div class="mt-4 overflow-x-auto">
  <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DV No</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payee</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Authorized Rep</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approver</th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      {#if $projectsLoading}
        <tr>
          <td colspan="7" class="px-6 py-4 text-center"><Spinner /> <span class="ml-2">Loading vouchers...</span></td>
        </tr>
      {:else if filteredVouchers.length === 0}
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-gray-500">No vouchers found for selected range.</td>
        </tr>
      {:else}
        {#each filteredVouchers as v}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-4 text-sm">{v.dv_no || 'N/A'}</td>
            <td class="px-4 py-4 text-sm">{v.payee_name || 'N/A'}</td>
            <td class="px-4 py-4 text-sm">{v.project_code || 'N/A'}</td>
            <td class="px-4 py-4 text-sm">{v.payment_mode || 'N/A'}</td>
            <td class="px-4 py-4 text-sm text-right">₱{parseFloat(v.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td class="px-4 py-4 text-sm">{v.authorized_representative || 'N/A'}</td>
            <td class="px-4 py-4 text-sm flex justify-between items-center gap-2">
              {v.approver || 'N/A'}
              <button
                class="text-red-600 text-xs hover:underline"
                on:click={() => deleteVoucher(v.dv_no)}
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  :global(input:focus) {
    outline: none;
    border-bottom: 2px solid var(--color-secondary);
  }
</style>
