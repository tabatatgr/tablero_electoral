// DashboardTitle Web Component

class DashboardTitle extends HTMLElement {
  async connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({mode: 'open'});
      // Cargar CSS externo y luego inyectar el HTML
      const cssUrl = new URL('./DashboardTitle.css', import.meta.url);
      let cssText = '';
      try {
        const resp = await fetch(cssUrl);
        cssText = await resp.text();
      } catch (e) {
        cssText = '';
      }
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
            max-width: 100vw;
            box-sizing: border-box;
          }
          ${cssText}
        </style>
        <div class="dashboard-title-sticky-header">
          <h1 class="dashboard-title-text">Herramienta de Simulación Electoral</h1>
        </div>
        <div class="dashboard-title-bar" style="background: transparent; box-shadow: none; width: 100%; max-width: 100vw; box-sizing: border-box; border-radius: 16px;">
          <slot style="width: 100%; display: block;"></slot>
        </div>
      `;
    }
  }
}
customElements.define('dashboard-title', DashboardTitle);
