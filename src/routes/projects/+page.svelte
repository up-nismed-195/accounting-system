<script lang="ts">
	import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient.js';

    const loadProjects = async (): Promise<Project[]> => {
        let { data: projects } = await supabase.from("project").select("code,name");
        return projects ?? []
    }

    // let projects: Project[] = data.projects ?? [];
    // let liquidations: LiquidationEntry[] = data.liquidation ?? [];
</script>

<div class="flex justify-between items-center gap-5">
    <!-- <h1 class="text-3xl font-semibold underline underline-offset-2 decoration-primary/75 hover:decoration-secondary/75"> -->

    <div class="flex justify-start items-center gap-4">
        <h1 class="text-3xl font-semibold">
            <a href="#top">
                Project
            </a>
        </h1>

        {#await loadProjects()}
            Loading...
        {:then projects} 
            <form class="">
                <select id="countries" class="font-bold bg-primary/10
                text-sm rounded-lg border-2 border-primary focus:ring-secondary focus:border-secondary
               
                appearance:none
                py-2.5 px-3">
                    {#each projects as project}
                        <option class="" value={project.code}>{project.code}</option>
                    {/each}
                </select>
            </form>
        {/await}    
        
        
    </div>

    <button type="button" class="border text-white bg-blue-700 hover:bg-blue-800
        focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
        Generate Liquidation Report
    </button>
</div>

<hr class="border-black/15 my-3">

<style>
    select {
        outline: 0;
    }
    option {
        text-decoration: italic;
    }
</style>


