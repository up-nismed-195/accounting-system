import { supabase } from "$lib/supabaseClient";

// export async function load() {
//     const { data: projects } = await supabase.from("project").select("code,name");
//     const { data: liquidation } = await supabase.from("liquidations").select();
//     return { projects, liquidation }
// }