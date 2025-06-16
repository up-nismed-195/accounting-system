import { supabase } from "$lib/supabaseClient";
  export async function load() {
    const { data } = await supabase
        .from("tests")
        .select()
        .single();

    return data;
  }