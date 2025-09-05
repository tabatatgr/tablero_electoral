class LoginBox extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <main class="login-main">
        <div class="background-image">
          <img src="imagenes/fondo_inicio.svg" alt="Imagen de bienvenida" />
        </div>
        <section class="login-wrapper">
          <h2 class="login-title">Inicia sesión</h2>
          <form class="login-form">
            <label for="username">Nombre de usuario</label>
            <input type="text" id="username" name="username" placeholder="Nombre de usuario" required />

            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" placeholder="********" required />

            <button type="submit">Ingresar</button>
          </form>
        </section>
      </main>
    `;

    // Lógica de validación y redirección
    const form = this.querySelector('.login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = form.username.value.trim();
      const password = form.password.value.trim();

      // Ejemplo simple: usuario prueba y contraseña prueba
      if (username === 'prueba' && password === 'prueba') {
        window.location.href = 'index.html';
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    });
  }
}
customElements.define('login-box', LoginBox);