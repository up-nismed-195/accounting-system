<script>
  import { writable } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';

  const headers = [
    "Payee", "Address", "DV No.", "Payment Mode", "Particulars", "TIN ID No.", "Remarks", "Actions", 
  ];

  const projects = ["UNICEF", "NISMED"]
  const dvNoIdx = headers.indexOf("DV No.");


  // Lock state for each column
  let locks = Array(headers.length).fill(false);

  // Hardcoded initial data (not directly editable)
  const initialRows = [
    ["", "", "", "", "", "", "", ""],
  ];

  // Reactive rows store
  const rows = writable(initialRows.map(row => [...row]));

  // Add a new row
  function addRow() {
    let newRow = [];
    $rows.length > 0
      ? headers.forEach((_, i) => {
          // If locked, copy from last row; else, empty
          newRow[i] = locks[i] ? $rows[$rows.length - 1][i] : "";
        })
      : headers.forEach(() => newRow.push(""));
    rows.update(r => [...r, newRow]);
  }

  // Toggle lock for a column
  function toggleLock(idx) {
    locks[idx] = !locks[idx];
    locks = [...locks];
  }

  // Update a cell
  function updateCell(rowIdx, colIdx, value) {
    rows.update(r => {
      r[rowIdx][colIdx] = value;
      return r;
    });
  }

  function deleteRow(idx) {
    rows.update(r => {
      r.splice(idx, 1);
      return [...r];
    });
  }

  function handleKeydown(event) {
    if (event.ctrlKey) {
      // Check if key is a single digit and within headers range
      const idx = parseInt(event.key, 10);
      if (!isNaN(idx) && idx >= 0 && idx < headers.length) {
        event.preventDefault(); // Prevent browser default (e.g., Ctrl+1 tab switch)
        toggleLock(idx - 1);
      }
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<h1 class="text-2xl text-display mb-5">Create a Voucher</h1>

<button
  class="mb-4 px-4 py-2 bg-nismed text-white rounded hover:bg-nismed/80 transition"
  on:click={addRow}
>
  Add Row
</button>

<table class="min-w-full border border-gray-300 rounded-overflow-hidden shadow-lg ">
  <thead class="text-xs">
  <tr class="bg-nismed text-white">
    {#each headers as header, i}
      <th class="px-3 py-1 text-left font-semibold">
        <div class="flex items-center gap-2">
          {#if headers[i] !== "Actions"}
            <button
              class="ml-2 focus:outline-none"
              on:click={() => toggleLock(i)}
              title={locks[i] ? "Unlock" : "Lock"}
              type="button"
            >
              {#if locks[i]}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 8V6a5 5 0 1110 0v2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2zm2-2a3 3 0 116 0v2H7V6z" clip-rule="evenodd"/></svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11V7a3 3 0 00-6 0m6 4H9m6 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2h8z"/></svg>
              {/if}
            </button>
          {/if}
          <span></span>
          {header}
        </div>
      </th>
    {/each}
  </tr>
</thead>
  <tbody class="text-sm">
  {#each $rows as row, rowIdx}
    <tr class={rowIdx % 2 === 0 ? "bg-[#f1f5f2]/50" : "bg-secondary/50"}>
      {#each row.slice(0, -1) as data, colIdx}
        <td class="px-1 py-2">
          {#if colIdx === dvNoIdx}
            <select
                class="w-full bg-transparent border-b border-transparent focus:border-nismed focus:outline-none transition-colors"
                bind:value={row[colIdx]}
                on:change={e => updateCell(rowIdx, colIdx, e.target.value)}
              >
                <option value="" disabled selected>Select</option>
                {#each projects as project}
                  <option value={project}>{project}</option>
                {/each}
            </select>
          {:else}
            <input
              class="w-full bg-transparent border-b border-transparent focus:border-nismed focus:outline-none transition-colors"
              type="text"
              bind:value={row[colIdx]}
              on:input={e => updateCell(rowIdx, colIdx, e.target.value)}
            />

        {/if}
        </td>
      {/each}
      <td class="px-1 py-2 align-middle">
        <div class="flex items-center justify-center h-full">
          <button
            class="text-gray-500 hover:text-gray-700"
            on:click={() => deleteRow(rowIdx)}
            title="Delete Row"
          >
            <!-- Trash icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  {/each}
</tbody>
</table>