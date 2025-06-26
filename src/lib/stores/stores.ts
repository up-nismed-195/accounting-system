import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const projectsLoading: Writable<boolean> = writable(true)
export const liquidationsLoading: Writable<boolean> = writable(true)