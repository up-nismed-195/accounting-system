<script>
  let { children } = $props();
  import "../app.css";
</script>

<div class="flex h-screen">
  <aside class="w-72 bg-white border-r-1 border-r-gray-200  flex flex-col py-10 px-6">
    <h1 class="text-2xl font-bold mb-10 text-gray-800 font-display">Accounting</h1>
    <nav class="flex flex-col gap-1">
        {#each [
            {name: "Vouchers", link: "/vouchers"},
            {name: "Projects", link: "/projects"},
            {name: "History", link: "/history"}
        ] as item}
        <a href={item.link} class="flex items-center px-4 py-4 rounded-lg text-gray-700 hover:underline hover:bg-gray-100 hover:text-blue-600 transition">
            {item.name}
        </a>
        {/each}
      
    </nav>
  </aside>

  <main class="h-screen w-full p-10">
    {@render children()}
  </main>
  
</div>




