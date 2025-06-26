<script lang="ts">
    import { supabase } from "$lib/supabaseClient";
    export let onClose: () => void;
    export let onCancel: () => void;

    let code = "";
    let title = "";

    function handleCancel() {
        onCancel();
    }

    async function handleSubmit() {
        const { data, error } = await supabase
            .from('project')
            .upsert({ code: code, name: title })
            .select()
        // TODO: Add your submit logic here (e.g., call Supabase)
        // Example: await supabase.from("project").insert({ code, name: title });
        onClose();
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-1">
    <h1 class="text-2xl font-semibold mb-5 underline decoration-primary">New Project</h1>
    <div>
        <label for="code" class="block text-sm font-medium mb-1">Project Code</label>
        <input
            name="code"
            type="text"
            bind:value={code}
            class="border-black/50 bg-primary/5 border rounded px-3 py-2 w-full"
            required
            placeholder="e.g. UNICEF"
        />
    </div>
    <div class="mt-2">
        <label for="title" class="block text-sm font-medium mb-1">Project Title</label>
        <input
            name="title"
            type="text"
            bind:value={title}
            class="border-black/50 bg-primary/5 border rounded px-3 py-2 w-full"
            required
            placeholder="e.g. UNICEF Education Project"
        />
    </div>
    <div class="flex flex-row-reverse gap-2.5 mt-8">
        <button
            type="submit"
            class="border text-white bg-primary hover:bg-emerald-900 font-medium rounded-lg text-sm px-9 py-2.5"
        >
            Create
        </button>
        <button
            type="button"
            class="border border-primary text-primary hover:underline hover:bg-primary/2 bg-white font-medium rounded-lg text-sm px-9 py-2.5"
            on:click={handleCancel}
        >
            Cancel
        </button>
    </div>
</form>