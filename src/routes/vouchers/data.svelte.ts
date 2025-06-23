import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const rows: Writable<App.VoucherUI[]> = writable(
    [
        {
            payee: "seth",
            address: "berkeley",
            project: "NISMED",
            particulars: "programmer",
            mode_of_payment: "cash",
            remarks: "conyo",
            amount: 7107.63,
            less_tax: 10,
        }
    ]
)



