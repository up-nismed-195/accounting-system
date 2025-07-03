<script>
  import "../app.css"
  import { page } from "$app/state";
  import { onMount } from "svelte";
  let { children } = $props();
</script>

<div class="layout-root font-display">
  <header class="navbar">
    <img src="/nismed.png" alt="NISMED Logo" class="logo" />
    <nav class="nav-menu">
      {#each [
        {name: "Dashboard", link: "/dashboard"},
        {name: "Vouchers", link: "/vouchers"},
        {name: "Projects", link: "/projects"},
        {name: "History", link: "/history"},
      ] as item}
      <a href={item.link} class="nav-link {page.url.pathname === item.link ? 'active' : ''}">
        {item.name}
      </a>
      {/each}
    </nav>
    <div class="nav-spacer"></div>
    <nav class="nav-help">
      {#each [
        {name: "How to use", link: "/how-to-use"},
        {name: "People", link: "/people"},
        {name: "About", link: "/about"},
      ] as item}
      <a href={item.link} class="nav-link">{item.name}</a>
      {/each}
    </nav>
  </header>
  <main class="main-content font-display">
    {@render children()}
  </main>
</div>

<style>
.layout-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden; /* Prevents horizontal scroll */
}
.navbar {
  display: flex;
  align-items: center;
  background: #f1f5f2;
  padding: 0 1rem;
  height: 4.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  z-index: 10;
}
.logo {
  height: 3.2rem;
  width: 3.2rem;
  margin-right: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 0.35rem;
  object-fit: contain;
  vertical-align: middle;
}
.nav-menu {
  display: flex;
  gap: 1rem;
}
.nav-spacer {
  flex: 1;
}
.nav-help {
  display: flex;
  gap: 1rem;
  margin-left: auto; /* Pushes nav-help to the rightmost */
}
.nav-link {
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  text-decoration: none;
  color: #222;
  font-weight: 500;
  transition: background 0.15s;
  white-space: nowrap;
}
.nav-link.active, .nav-link:hover {
  background: #e0e7ef;
  color: #2563eb;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* Prevents horizontal scroll */
  padding: 2.5rem 5rem;
  box-sizing: border-box;
  background: #f8fafc;
}
</style>