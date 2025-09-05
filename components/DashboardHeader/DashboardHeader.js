export class DashboardHeader extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }
  
  render() {
    this.innerHTML = `
      <div style="width:100%;height:100%;padding-top:8px;padding-left:56px;padding-right:56px;background:#5F7272;box-shadow:0px 4px 5px rgba(0,0,0,0.05);justify-content:space-between;align-items:center;display:flex;">
        <div style="flex:1 1 0;height:59px;justify-content:flex-start;align-items:center;gap:10px;display:flex;">
          <div style="justify-content:center;display:flex;flex-direction:column;color:var(--Neutro---Neutro-100,white);font-size:24px;font-family:'Noto Sans',sans-serif;font-weight:700;word-wrap:break-word;">Reforma Electoral</div>
        </div>
        
        <button id="logoutBtn" style="
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          font-family: 'Noto Sans', sans-serif;
          font-weight: 400;
          cursor: pointer;
          text-decoration: none;
          transition: text-decoration 0.2s ease;
        ">
          Cerrar Sesión
        </button>
      </div>
    `;
  }
  
  setupEventListeners() {
    const logoutBtn = this.querySelector('#logoutBtn');
    if (logoutBtn) {
      // Hover effects - underline on hover
      logoutBtn.addEventListener('mouseenter', () => {
        logoutBtn.style.textDecoration = 'underline';
      });
      
      logoutBtn.addEventListener('mouseleave', () => {
        logoutBtn.style.textDecoration = 'none';
      });
      
      // Click handler
      logoutBtn.addEventListener('click', () => {
        if (window.authManager) {
          window.authManager.logout('manual');
        }
      });
    }
  }
}

customElements.define('dashboard-header', DashboardHeader);
