import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const storedProject: Writable<string> = writable("")