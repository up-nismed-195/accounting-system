import { supabase } from "$lib/supabaseClient";

export async function load() {
    const { data: project_summaries } = await supabase
        .from("project_summaries")
        .select()

    return { project_summaries }
}