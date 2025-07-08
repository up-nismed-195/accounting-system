<script lang="ts">
  export let data;
  let email = '';
  let password = '';
  let error = data?.error;
</script>

<div class="login-page">
  <form class="login-form" method="POST">
    <div class="logo-icon">
      <img src="/nismed.png" alt="Logo" />
    </div>
    <h1>NISMED</h1>
    <p>Accounting System</p>

    <input type="email" name="email" bind:value={email} placeholder="Email" required />
    <input type="password" name="password" bind:value={password} placeholder="Password" required />

    <button type="submit">Sign In</button>

    {#if error}
      <div class="error">{error}</div>
    {/if}
  </form>
</div>

<style>
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('/background.jpg') no-repeat center center fixed;
    background-size: cover;
    height: 100vh;
  }

  .login-form {
    background: rgba(255, 255, 255, 0.95);
    padding: 3rem;
    border-radius: 20px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    text-align: center;
  }

  .logo-icon {
    width: 100px;
    height: 100px;
    background: #059669;
    border-radius: 20px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-icon img {
    width: 80px;
    height: 80px;
    filter: brightness(0) invert(1);
  }

  h1 {
    margin: 0.5rem 0 0.25rem;
    font-size: 2rem;
    color: #064e3b;
  }

  p {
    color: #047857;
    margin-bottom: 2rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.8rem;
    margin-bottom: 1rem;
    border: 2px solid #d1fae5;
    border-radius: 12px;
    font-size: 1rem;
  }

  button {
    background: linear-gradient(135deg, #059669, #047857);
    color: white;
    padding: 0.8rem;
    width: 100%;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .error {
    margin-top: 1rem;
    color: #dc2626;
    background: rgba(254, 226, 226, 0.9);
    padding: 0.75rem;
    border-radius: 8px;
  }
</style>