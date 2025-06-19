<script lang="ts">
    import { table_data } from './data.svelte.js';

    let { row, i } = $props()


    // helpers
    const keys = Object.keys(row)

    $effect(() => {
        // console.log('table_data changed:', $table_data.rows)
    })

    // modifiers
    function deleteRow() {
        $table_data.rows = [
            ...$table_data.rows.slice(0, i),
            ...$table_data.rows.slice(i + 1)
        ];
    }

    function updateValue(key: string, value: string) {
        $table_data.rows = $table_data.rows.map((r, idx) =>
            idx === i ? { ...r, [key]: value } : r
        );
    }
</script>

<tr>
    <td>{i}</td>
    {#each keys as key}
        <td class="">
            <input 
                type="text" 
                class="underline-input" 
                value={row[key]}
                oninput={e => updateValue(key, e.target.value)}
            />
        </td>
    {/each}
    <td>
        <button onclick={deleteRow} class="bg-red-500 hover:bg-red-600 text-white">delete</button>
    </td>
</tr>

<style>

</style>