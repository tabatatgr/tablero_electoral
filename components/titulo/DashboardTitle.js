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
        <style>${cssText}</style>
        <div class="dashboard-title-bar" style="background: var(--Neutro-200); box-shadow: none;">
          <span class="dashboard-title-text">Herramienta de Simulación Electoral</span>
          <slot></slot>
        </div>
      `;
    }
  }
}
customElements.define('dashboard-title', DashboardTitle);
