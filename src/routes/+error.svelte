<script>
  export let error;
  export let status;
</script>

<svelte:head>
  <title>{status} — Error</title>
</svelte:head>

<main style="text-align:center; margin-top:4rem;">
  <h1>{status}</h1>
  <h2>Something went wrong</h2>
  <pre style="color: #c00; background: #f9f9f9; padding: 1rem; border-radius: 6px;">
    {error?.message}
  </pre>
  {#if error?.stack}
    <details>
      <summary>Stack trace</summary>
      <pre>{error.stack}</pre>
    </details>
  {/if}
</main>