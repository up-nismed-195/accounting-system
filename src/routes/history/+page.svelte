<script lang="ts">
  


  // ====================
  // Loading initial data
  // ====================

  import Spinner from "$lib/components/Spinner.svelte";
  import { projectsLoading } from "$lib/stores/stores";
  import { supabase } from "$lib/supabaseClient";

  let projects: string[] = $state([])

  async function loadVouchers() {

    const { error, data } = await supabase
        .from("voucher")
        .select();
        alert(JSON.stringify(data))
  }

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
      <!-- <span class="ml-0.5 -mb-0.5 text-sm">to</span> -->
      {#if $projectsLoading}
        <Spinner />
      {:else}
      <select id="countries" class=" bg-primary/10
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
  
<!-- <hr class="border-black/10 border-1 mt-2 mb-4 border-dashed"> -->

<div class="mt-4 mb-0.5 gap-2 flex items-center">
  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm mb-2">Authorized representative: </span> 
    <input class="border-b border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2" type="text">
  </div>

  <div class="text-black/30">•</div>

  <div class="flex justify-start gap-2">
    <span class="font-medium text-sm">Approver: </span> 
    <input class="border-b   border-gray-600 h-5 outline-none focus:ring-0 focus:border-blue-600 focus:border-b-2"  type="text">
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