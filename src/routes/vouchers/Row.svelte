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
        <td>
            <input 
                type="text" 
                class="underline-input" 
                value={row[key]}
                on:input={e => updateValue(key, e.target.value)}
            />
        </td>
    {/each}
    <td>
    <button on:click={deleteRow}>delete</button>
    </td>
</tr>

<style>
    tr, td {
        border: 1px solid black;
        padding: 1px;
    }


    .underline-input {
        border: none;
        border-bottom: 1px solid #333;
        background: transparent;
        outline: none;
        width: 100%;
    }
</style>