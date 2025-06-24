<script>
  import "../app.css"
  import { page } from "$app/state";
  import { onMount } from "svelte";
  let { children } = $props();
</script>

<div class="layout-root">
  <aside class="sidebar">
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
      <a href={item.link} class="block w-full py-3 px-5 rounded-full 
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
  <main class="main-content">
    {@render children()}
  </main>
</div>

<style>
.layout-root {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 12rem; 
  height: 100vh;
  background: #f1f5f2;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.main-content {
  margin-left: 12rem; 
  width: calc(100vw - 12rem);
  height: 100vh;
  overflow-x: auto;
  overflow-y: auto;
  padding: 2.5rem 2.5rem 2.5rem 0;
  box-sizing: border-box;
}
</style>