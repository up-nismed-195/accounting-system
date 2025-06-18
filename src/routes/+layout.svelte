<script>
  import "../app.css"
  import { page } from "$app/state";
	import { onMount } from "svelte";
  let { children } = $props();



</script>

<div class="flex h-screen font-display font-semibold">
    <aside class="w-72 bg-bg text-display flex flex-col bg-[#f1f5f2]/50 px-4 py-4 shadow-md">
        <span class="text-lg mb-2">
          Menu
        </span>   
        <nav class="w-full text-sm flex flex-col gap-1">
          {#each [
            {name: "Dashboard", link: "/"},
            {name: "Vouchers", link: "/vouchers"},
            {name: "Projects", link: "/projects"},
            {name: "History", link: "/history"},
            {name: "Reports", link: "/reports"},
          ] as item}
          <a href={item.link} class=" block w-full py-3 px-5 rounded-full 
          {page.url.pathname === item.link ? "bg-secondary/50 text-nismed" : "hover:bg-gray-200/60"}">
            {item.name}
          </a>
          {/each}
        </nav>

        <span class="text-lg font-bold mt-4 py-2 border-t border-display/30">
          Help
        </span>

        <nav class="w-full text-sm flex flex-col gap-1">
          {#each [
            {name: "How to use", link: "/how-to-use"},
            {name: "People", link: "/people"},
            {name: "About", link: "/about"},
          ] as item}
          <a href={item.link} class="block w-full py-3 px-5 rounded-full {page.url.pathname === item.link ? "bg-secondary/50" : "hover:bg-gray-200/80"}">        
            {item.name}
          </a>
          {/each}
        </nav>

    </aside>
    <main class="flex-1 px-16 py-16">
        {@render children()}
    </main>
</div>

