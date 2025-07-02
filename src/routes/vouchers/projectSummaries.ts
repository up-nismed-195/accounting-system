import { writable } from "svelte/store";
import type { Writable } from "svelte/store";


type Summary = {
    name: string,
    code: string,
}

export const projectSummaries: Writable<Summary[]> = writable([])