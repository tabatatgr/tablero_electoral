export class DashboardHeader extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  render() {
    // Get today's date in dd-mm-yyyy
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const fecha = `${day}-${month}-${year}`;
    this.innerHTML = `
      <div style="width:100%;height:100%;padding-top:8px;padding-left:56px;padding-right:56px;background:#5F7272;box-shadow:0px 4px 5px rgba(0,0,0,0.05);justify-content:flex-start;align-items:center;gap:56px;display:inline-flex;">
        <div style="flex:1 1 0;height:59px;justify-content:flex-start;align-items:center;gap:10px;display:flex;">
          <div style="justify-content:center;display:flex;flex-direction:column;color:var(--Neutro---Neutro-100,white);font-size:24px;font-family:'Noto Sans',sans-serif;font-weight:700;word-wrap:break-word;">Reforma Electoral</div>
        </div>
        <div style="flex:1 1 0;text-align:right;color:var(--Neutro---Neutro-100,white);font-size:16px;font-family:'Noto Sans',sans-serif;font-weight:400;line-height:22px;word-wrap:break-word;">Fecha de corte: ${fecha}</div>
      </div>
    `;
  }
}

customElements.define('dashboard-header', DashboardHeader);
