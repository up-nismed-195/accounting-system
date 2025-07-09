<script>
	import { onMount } from "svelte";
    import { storedProject } from "$lib/stores/projects";

    onMount(() => {
        alert($storedProject)
    })
</script>