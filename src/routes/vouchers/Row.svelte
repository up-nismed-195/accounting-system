<script lang="ts">
  import { rows } from './data.svelte.js';

  export let row: App.VoucherUI;
  export let index: number;

  function deleteRow() {
    $rows = [
      ...$rows.slice(0, index),
      ...$rows.slice(index + 1)
    ];
  }

  let BASE = 23
  let dv = (`${row.project}-${new Date().getFullYear().toString().slice(2)}-${BASE + index}`) 
</script>

<tr class="">
    <td>{dv}</td>
    {#each Object.values(row) as value}
        <td>{value}</td>
    {/each}
    <td>
    <button on:click={deleteRow} class="">delete</button>
    </td>
</tr>
