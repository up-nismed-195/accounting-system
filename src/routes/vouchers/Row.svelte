<script lang="ts">
    import { table_data } from './data.svelte.js';
    import { generateVoucher } from './voucherGenerator.js';

    let { row, i } = $props()

    // helpers
    const keys = Object.keys(row)
    $effect(() => {
        // console.log('table_data changed:', $table_data.rows)
    })
    let dv_no = $derived(`${row['Project']}-${row['Date']}-${row['No.']}`)

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

    function toPDF() {
        const converted = {
            payee: row["Payee"].toString(),
            address: row["Address"].toString(),
            dv_no: dv_no,
            mode: row["Mode"].toString(),
            charge: row["Gross"].toString(),
            particulars: row["Particulars"].toString(),
            authorized_rep: row["Authorized Rep"].toString(),
            approver: row["Approver"].toString(),
            amount: parseInt(row["Amount"]),
            apply_tax: !!row["Apply Tax"]
        }
        
        console.log(converted)
        generateVoucher(converted)
    }

    function handleGenerateVoucher() {
        generateVoucher({
            payee:row["Payee"],
            address:row["Address"],
            dv_no:dv_no,
            mode:row["Mode"],
            charge:row["Gross"],
            particulars:row["Particulars"],
            authorized_rep:'1',
            approver:'1',
            amount:1234,
            apply_tax: false,
        });

        console.log("yes")
  }
</script>

<tr>
    <td>{dv_no}</td>
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
        <button onclick={toPDF} class="bg-red-500 hover:bg-red-600 text-white">pdf</button>
    </td>
</tr>

<style>
input {
    width: 100%;
}
</style>