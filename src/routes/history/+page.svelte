<script lang="ts">
  // ====================
  // Loading initial data
  // ====================

  import Spinner from "$lib/components/Spinner.svelte";
  import { projectsLoading } from "$lib/stores/stores";
  import { supabase } from "$lib/supabaseClient";

  let projects: string[] = $state([])
  let vouchers: any[] = $state([])
  let filteredVouchers: any[] = $state([])
  let dateFilter: string = $state('all') // 'all', 'today', 'week', 'month', 'custom'
  let customStartDate: string = $state('')
  let customEndDate: string = $state('')

  async function loadVouchers() {
    const { error, data } = await supabase
        .from("voucher")
        .select()
        .order('created_at', { ascending: false }); // Default: most recent first
        
    if (data) {
      vouchers = data;
      filterVouchers(); // Apply initial filter
    }
    if (error) {
      console.error('Error loading vouchers:', error);
    }
  }

  function filterVouchers() {
    const now = new Date();
    let filtered = [...vouchers];

    switch (dateFilter) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = vouchers.filter(v => {
          const voucherDate = new Date(v.created_at);
          return voucherDate >= today;
        });
        break;
        
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = vouchers.filter(v => {
          const voucherDate = new Date(v.created_at);
          return voucherDate >= weekAgo;
        });
        break;
        
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filtered = vouchers.filter(v => {
          const voucherDate = new Date(v.created_at);
          return voucherDate >= monthAgo;
        });
        break;
        
      case 'custom':
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999); // Include end of day
          
          filtered = vouchers.filter(v => {
            const voucherDate = new Date(v.created_at);
            return voucherDate >= startDate && voucherDate <= endDate;
          });
        }
        break;
        
      case 'all':
      default:
        // Already sorted by most recent first from the query
        filtered = vouchers;
        break;
    }
    
    filteredVouchers = filtered;
  }

  // Reactive statement to filter when date filter changes
  $effect(() => {
    if (vouchers.length > 0) {
      filterVouchers();
    }
  });

  // =======
  // onMount
  // =======
  
  import { onMount } from "svelte";
  onMount(async () => {
    $projectsLoading = true
    await loadVouchers()
    $projectsLoading = false
  })

</script>

<div class="flex justify-between items-start gap-5">
  <div class="flex justify-start items-center gap-3">
    <div class="flex gap-3 items-center">
      <h1 class="text-4xl font-semibold">
        <a href="#top">History</a> 
      </h1> 
      
      {#if $projectsLoading}
        <Spinner />
      {:else}
        <select id="countries" class="bg-primary/10
        text-sm rounded-lg border-2 border-primary hover:bg-primary/20
        appearance:none font-bold
        py-2.5 px-2">
          {#each projects as project}
            <option class="" value={project} selected>{project}</option>
          {/each}
        </select>
      {/if}
    </div>

    <div class="py-3 text-black/30">•</div>

    <!-- Date Filter Controls -->
    <div class="flex gap-2 items-center">
      <span class="text-sm font-medium">Filter by date:</span>
      <select 
        bind:value={dateFilter}
        class="bg-white border border-gray-300 text-sm rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>

    <!-- Custom Date Range Inputs -->
    {#if dateFilter === 'custom'}
      <div class="flex gap-2 items-center">
        <input 
          type="date" 
          bind:value={customStartDate}
          class="border border-gray-300 text-sm rounded px-2 py-1"
          placeholder="Start date"
        />
        <span class="text-sm">to</span>
        <input 
          type="date" 
          bind:value={customEndDate}
          class="border border-gray-300 text-sm rounded px-2 py-1"
          placeholder="End date"
        />
      </div>
    {/if}

    <div class="py-3 text-black/30">•</div>

    <div style="">
      <button
        type="button"
        class="border text-white bg-green-800 hover:bg-green-900 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
      >
        Add Row
      </button>
    </div>
  </div>

  <div class="flex gap-1">
    <button
      type="button"
      class="border text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
    >
      Save all
    </button>
    <button
      type="button"
      class="border text-white bg-red-600 hover:bg-red-800 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
    >
      Download all as PDF
    </button>
  </div>
</div>

<!-- Results count -->
<div class="mt-2 text-sm text-gray-600">
  Showing {filteredVouchers.length} of {vouchers.length} vouchers
</div>

<div class="mt-4 mb-0.5 gap-2 flex items-center">
  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm mb-2">Authorized representative: </span> 
    <input class="border-b border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2" type="text">
  </div>

  <div class="text-black/30">•</div>

  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Approver: </span> 
    <input class="border-b border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2" type="text">
  </div>
</div>

<style>
:global(tbody > tr:last-child input) {
  outline: none;
  border-bottom: 1px solid rgba(150, 150, 150, 0.82);
}

:global(input:focus), :global(tbody > tr:last-child input:focus) {
  outline: none;
  border-bottom: 2px solid var(--color-secondary);
}
</style>