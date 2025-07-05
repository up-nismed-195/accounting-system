<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NISMED - Accounting System</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: url('background.jpg') no-repeat center center fixed;
      background-size: cover;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-form {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-icon {
      width: 100px;
      height: 100px;
      margin: 0 auto 1rem;
      background: #059669;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon img {
      width: 90px;
      height: 90px;
      filter: brightness(0) invert(1);
    }

    .logo-section h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #064e3b;
      margin: 0;
      letter-spacing: 2px;
    }

    .logo-section p {
      font-size: 1.1rem;
      color: #047857;
      margin: 0.5rem 0 0 0;
      font-weight: 500;
    }

    .input-group {
      margin-bottom: 1.5rem;
    }

    input {
      width: 100%;
      padding: 1rem 1.25rem;
      border: 2px solid #d1fae5;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    input:focus {
      outline: none;
      border-color: #059669;
      box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.15);
    }

    input::placeholder {
      color: #6b7280;
    }

    button {
      width: 100%;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #059669, #047857);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
    }

    .error {
      color: #dc2626;
      font-size: 0.9rem;
      text-align: center;
      background: rgba(254, 226, 226, 0.9);
      padding: 0.75rem;
      border-radius: 8px;
      margin-top: 1rem;
      display: none;
    }
  </style>
</head>
<body>
  <form class="login-form" id="loginForm">
    <div class="logo-section">
      <div class="logo-icon">
        <img src="nismed.png" alt="NISMED Logo" />
      </div>
      <h1>NISMED</h1>
      <p>Accounting System</p>
    </div>

    <div class="input-group">
      <input type="text" id="username" placeholder="Username" required />
    </div>

    <div class="input-group">
      <input type="password" id="password" placeholder="Password" required />
    </div>

    <button type="submit">Sign In</button>
    <div id="error" class="error"></div>
  </form>

  <script>
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('error');

      try {
        const response = await fetch('/login', {
          method: 'POST',
          body: new URLSearchParams({ username, password })
        });

        if (response.ok) {
          window.location.href = '/dashboard';
        } else {
          const data = await response.json();
          errorDiv.textContent = data.error || 'Invalid login';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
      }
    });
  </script>
</body>
</html>
