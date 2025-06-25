import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const projects: Writable<Project[]> = writable([])
export const projectsLoading: Writable<boolean> = writable(true)
export const liquidations: Writable<LiquidationEntry[]> = writable([])