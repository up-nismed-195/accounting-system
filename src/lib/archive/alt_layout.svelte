<script>
    import "../app.css"
    let { children } = $props()
</script>

<!-- Example Svelte component using Tailwind CSS for a clean sidebar layout -->

<div class="flex min-h-screen bg-gray-50">
  <!-- Sidebar -->
  <aside class="w-64 bg-white shadow-lg flex flex-col py-8 px-6">
    <h1 class="text-2xl font-bold mb-10 text-gray-800 font-display">Accounting</h1>
    <nav class="flex flex-col gap-4">
      <a href="#" class="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition">
        Vouchers
      </a>
      <a href="#" class="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition">
        Projects
      </a>
      <a href="#" class="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition">
        History
      </a>
    </nav>
  </aside>
</div>

{@render children()}


 