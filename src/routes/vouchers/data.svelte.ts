import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { generateRandomVoucherData } from "./helpers";

export const rows: Writable<VoucherEntry[]> = writable()

