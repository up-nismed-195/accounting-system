<script lang="ts">
  import { table_data } from './data.svelte.js';

  export let row;
  export let i: number;

  function deleteRow() {
    $table_data.rows = [
      ...$table_data.rows.slice(0, i),
      ...$table_data.rows.slice(i + 1)
    ];
  }
</script>

<tr class="border">
    <td>{i}</td>
    {#each Object.values(row) as value}
        <td>{value}</td>
    {/each}
    <td>
    <button on:click={deleteRow} class="border">delete</button>
    </td>
</tr>
