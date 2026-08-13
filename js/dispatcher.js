/**
 * Gotham Emergency Response System - Dispatcher Dashboard Logic
 * Updated for Cyberpunk (Concept E) Theme
 */

document.addEventListener('DOMContentLoaded', () => {
  const reportsListEl = document.getElementById('reportsList');
  const countFireEl = document.getElementById('countFire');
  const countPoliceEl = document.getElementById('countPolice');
  const countMedicalEl = document.getElementById('countMedical');
  const activeTotalLabel = document.getElementById('activeTotalLabel');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const btnResetData = document.getElementById('btnResetData');

  const detailModal = document.getElementById('detailModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalTypeBadge = document.getElementById('modalTypeBadge');
  const modalId = document.getElementById('modalId');
  const modalTimestamp = document.getElementById('modalTimestamp');
  const modalLocation = document.getElementById('modalLocation');
  const modalCaller = document.getElementById('modalCaller');
  const modalNotes = document.getElementById('modalNotes');
  const statusBtns = document.querySelectorAll('.status-btn');

  let activeFilter = 'All';
  let currentSelectedReportId = null;
  let map = null;
  let mapMarkers = [];

  function createCustomIcon(type) {
    let color = 'var(--cy-cyan)';
    if(type === 'Fire') color = 'var(--cy-magenta)';
    
    const svgHtml = `
      <div style="position:relative; width:24px; height:24px;">
        <div style="position:absolute; inset:0; border:2px solid ${color}; border-radius:50%; box-shadow: 0 0 8px ${color}; animation: pulseDot 1.5s infinite;"></div>
        <div style="position:absolute; top:10px; left:10px; width:4px; height:4px; background:${color}; border-radius:50%; box-shadow: 0 0 8px ${color};"></div>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  }

  function initMap() {
    if (!document.getElementById('map')) return;

    map = L.map('map', { zoomControl: false }).setView([40.7150, -74.0080], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'CARTO',
      maxZoom: 19
    }).addTo(map);
  }

  function updateMapMarkers(reports) {
    if (!map) return;

    mapMarkers.forEach(m => map.removeLayer(m));
    mapMarkers = [];

    const bounds = [];

    reports.forEach(report => {
      if (report.lat && report.lng) {
        const marker = L.marker([report.lat, report.lng], {
          icon: createCustomIcon(report.type)
        }).addTo(map);

        const popupContent = `
          <div style="font-family: var(--font-mono); font-size: 11px;">
            <div style="color: var(--cy-magenta); margin-bottom: 4px;">#${report.id.substring(9)}</div>
            <div style="text-transform: uppercase;">TYPE: ${report.type}</div>
            <div style="text-transform: uppercase;">STAT: ${report.status}</div>
            <button class="cyber-btn" style="margin-top: 8px; font-size: 9px; padding: 4px 8px;" onclick="window.openDetailModal('${report.id}')">DETAILS</button>
          </div>
        `;

        marker.bindPopup(popupContent);
        mapMarkers.push(marker);
        bounds.push([report.lat, report.lng]);
      }
    });

    if (bounds.length > 0 && reports.length <= 5) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
    }
  }

  function renderDashboard() {
    const allReports = getReports();

    const counts = { Fire: 0, Police: 0, Medical: 0 };
    allReports.forEach(r => {
      if (counts[r.type] !== undefined) counts[r.type]++;
    });

    countFireEl.textContent = counts.Fire.toString().padStart(2, '0');
    countPoliceEl.textContent = counts.Police.toString().padStart(2, '0');
    countMedicalEl.textContent = counts.Medical.toString().padStart(2, '0');
    activeTotalLabel.textContent = allReports.length.toString().padStart(2, '0');

    const filtered = allReports.filter(r => {
      if (activeFilter === 'All') return true;
      return r.type === activeFilter;
    });

    updateMapMarkers(filtered);

    reportsListEl.innerHTML = '';

    if (filtered.length === 0) {
      reportsListEl.innerHTML = `
        <tr>
          <td colspan="2" style="text-align: center; color: var(--cy-text-muted);">// NO DATA MATCHES FILTER</td>
        </tr>
      `;
      return;
    }

    filtered.forEach(report => {
      const tr = document.createElement('tr');
      
      const t = report.type.substring(0,3).toUpperCase();
      const idShort = report.id.replace('GOTH-911-', '');
      const title = (report.title || 'UNKNOWN INCD').toUpperCase();
      
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 12px;">
          <span style="color: var(--cy-magenta);">[${idShort}]</span> 
          <span style="color: var(--cy-cyan);">${t}</span> 
          <span style="color: #fff;">${title}</span>
        </td>
        <td style="font-family: var(--font-mono); font-size: 11px;">
          <div class="status-chip" style="${report.status === 'Resolved' ? 'border-color: var(--cy-cyan); color: var(--cy-cyan);' : ''}">
            <div class="status-dot" style="${report.status === 'Resolved' ? 'background: var(--cy-cyan);' : ''}"></div>
            ${report.status.toUpperCase()}
          </div>
        </td>
      `;

      tr.addEventListener('click', () => {
        openDetailModal(report.id);
      });

      reportsListEl.appendChild(tr);
    });
  }

  function openDetailModal(reportId) {
    const reports = getReports();
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    currentSelectedReportId = report.id;

    modalTitle.textContent = (report.title || `${report.type} Incident`).toUpperCase();
    
    // Add glitch effect
    modalTitle.setAttribute('data-text', modalTitle.textContent);
    
    modalTypeBadge.innerHTML = `<div class="status-dot"></div>${report.type.toUpperCase()}`;
    
    modalId.textContent = report.id;
    
    const d = new Date(report.timestamp);
    const timeStr = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    modalTimestamp.textContent = `T-MINUS: ${timeStr}`;
    
    modalLocation.textContent = report.locationName.toUpperCase() + ` [${report.lat}, ${report.lng}]`;
    modalCaller.textContent = `${report.callerName || 'ANON_USR'} // ${report.callerPhone || 'NO_COMMS'}`.toUpperCase();
    modalNotes.textContent = report.notes.toUpperCase();

    statusBtns.forEach(btn => {
      if (btn.getAttribute('data-status') === report.status) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    detailModal.classList.add('open');
  }

  window.openDetailModal = openDetailModal;

  closeModalBtn.addEventListener('click', () => {
    detailModal.classList.remove('open');
  });

  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentSelectedReportId) return;

      const newStatus = btn.getAttribute('data-status');
      updateReportStatus(currentSelectedReportId, newStatus);

      statusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderDashboard();
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeFilter = btn.getAttribute('data-filter');
      renderDashboard();
    });
  });

  btnResetData.addEventListener('click', () => {
    if (confirm('Reset mock data?')) {
      resetToDefaultData();
      renderDashboard();
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'gotham_emergency_reports') {
      renderDashboard();
    }
  });

  window.addEventListener('gotham_data_updated', () => {
    renderDashboard();
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  initMap();
  renderDashboard();
});
