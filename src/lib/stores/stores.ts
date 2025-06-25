import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export let projects: Writable<Project[]> = writable([])