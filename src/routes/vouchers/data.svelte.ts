import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { generateRandomVoucherData } from "./helpers";

export const rows: Writable<App.VoucherUI[]> = writable(
    [generateRandomVoucherData()]
)

export const projects: Writable<string[]> = writable([
 "NISMED",
 "UNICEF",   
])

