// DashboardTitle Web Component
class DashboardTitle extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = `
        <style>@import url('../components/DashboardTitle.css');</style>
        <div class="dashboard-title-bar" style="background: var(--Neutro-200); box-shadow: none;">
          <span class="dashboard-title-text">Herramienta de Simulación Electoral</span>
          <slot></slot>
        </div>
      `;
    }
  }
}
customElements.define('dashboard-title', DashboardTitle);
