/**
 * Gotham Emergency Response System - Dispatcher Dashboard Logic
 * Handles User Story 2 (Details Review, Real-time Sync, Leaflet Map Integration)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const reportsListEl = document.getElementById('reportsList');
  const countFireEl = document.getElementById('countFire');
  const countPoliceEl = document.getElementById('countPolice');
  const countMedicalEl = document.getElementById('countMedical');
  const activeTotalLabel = document.getElementById('activeTotalLabel');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const btnResetData = document.getElementById('btnResetData');

  // Modal Elements
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

  // Map Color Mapping for Emergency Pins
  const TYPE_COLORS = {
    Police: '#3B82F6',
    Fire: '#EF4444',
    Medical: '#10B981'
  };

  // Helper for custom Leaflet SVG pin icon
  function createCustomIcon(type) {
    const color = TYPE_COLORS[type] || '#3B82F6';
    const iconChar = type === 'Fire' ? '🚒' : type === 'Police' ? '🚓' : '🚑';
    
    const svgHtml = `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFF;
        box-shadow: 0 0 15px ${color};
        font-size: 16px;
      ">
        ${iconChar}
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-map-pin',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });
  }

  // Initialize Leaflet Map
  function initMap() {
    if (!document.getElementById('map')) return;

    // Gotham City centered default (New York coordinates proxy)
    map = L.map('map').setView([40.7150, -74.0080], 13);

    // Dark Matter tile layer for Gotham ambiance
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> Gotham Command',
      maxZoom: 19
    }).addTo(map);
  }

  // Update map markers based on reports data
  function updateMapMarkers(reports) {
    if (!map) return;

    // Clear existing markers
    mapMarkers.forEach(m => map.removeLayer(m));
    mapMarkers = [];

    const bounds = [];

    reports.forEach(report => {
      if (report.lat && report.lng) {
        const marker = L.marker([report.lat, report.lng], {
          icon: createCustomIcon(report.type)
        }).addTo(map);

        // Map popup content
        const popupContent = `
          <div class="popup-card">
            <span class="popup-badge" style="background:${TYPE_COLORS[report.type]}; color:#FFF;">${report.type}</span>
            <div class="popup-title">${escapeHtml(report.title || report.type + ' Emergency')}</div>
            <div class="popup-loc">📍 ${escapeHtml(report.locationName)}</div>
            <div style="font-size:0.75rem; color:#9CA3AF; margin-bottom:8px;">Status: <strong>${report.status}</strong></div>
            <button onclick="window.openDetailModal('${report.id}')" style="width:100%; background:#2563EB; color:#FFF; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; cursor:pointer;">View Full Details</button>
          </div>
        `;

        marker.bindPopup(popupContent);
        mapMarkers.push(marker);
        bounds.push([report.lat, report.lng]);
      }
    });

    // Optionally fit bounds if markers exist
    if (bounds.length > 0 && reports.length <= 5) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }

  // Render Reports List
  function renderDashboard() {
    const allReports = getReports();

    // Update Counter Telemetry
    const counts = { Fire: 0, Police: 0, Medical: 0 };
    allReports.forEach(r => {
      if (counts[r.type] !== undefined) counts[r.type]++;
    });

    countFireEl.textContent = counts.Fire;
    countPoliceEl.textContent = counts.Police;
    countMedicalEl.textContent = counts.Medical;
    activeTotalLabel.textContent = `${allReports.length} TOTAL INCIDENTS`;

    // Filter reports
    const filtered = allReports.filter(r => {
      if (activeFilter === 'All') return true;
      return r.type === activeFilter;
    });

    // Update Map
    updateMapMarkers(filtered);

    // Clear List DOM
    reportsListEl.innerHTML = '';

    if (filtered.length === 0) {
      reportsListEl.innerHTML = `
        <div style="text-align: center; color: var(--text-dim); padding: 3rem 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🚨</div>
          <div>No emergency reports found for this filter.</div>
        </div>
      `;
      return;
    }

    // Loop & Render HTML elements for each report
    filtered.forEach(report => {
      const card = document.createElement('div');
      card.className = `incident-card ${report.type}`;

      const timeAgo = formatTimeAgo(report.timestamp);

      card.innerHTML = `
        <div class="incident-top">
          <span class="incident-id">${escapeHtml(report.id)}</span>
          <span class="status-badge ${report.status}">${escapeHtml(report.status)}</span>
        </div>
        <div class="incident-title">${escapeHtml(report.title || report.type + ' Emergency')}</div>
        <div class="incident-meta">
          <span>📍 ${escapeHtml(report.locationName)}</span>
        </div>
        <div class="incident-notes">${escapeHtml(report.notes)}</div>
        <div class="incident-footer">
          <span>👤 ${escapeHtml(report.callerName || 'Anonymous')}</span>
          <span>⏱️ ${timeAgo}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openDetailModal(report.id);
      });

      reportsListEl.appendChild(card);
    });
  }

  // Open Emergency Details Modal (User Story 2)
  function openDetailModal(reportId) {
    const reports = getReports();
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    currentSelectedReportId = report.id;

    modalTitle.textContent = report.title || `${report.type} Incident`;
    modalTypeBadge.textContent = report.type.toUpperCase();
    modalTypeBadge.style.backgroundColor = TYPE_COLORS[report.type] || '#3B82F6';
    
    modalId.textContent = report.id;
    modalTimestamp.textContent = new Date(report.timestamp).toLocaleString();
    modalLocation.textContent = `${report.locationName} (${report.lat}, ${report.lng})`;
    modalCaller.textContent = `${report.callerName || 'Anonymous'} (${report.callerPhone || 'No contact phone'})`;
    modalNotes.textContent = report.notes;

    // Highlight active status button
    statusBtns.forEach(btn => {
      if (btn.getAttribute('data-status') === report.status) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    detailModal.classList.add('open');
  }

  // Expose to window for popup click call
  window.openDetailModal = openDetailModal;

  // Close Modal
  closeModalBtn.addEventListener('click', () => {
    detailModal.classList.remove('open');
  });

  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) detailModal.classList.remove('open');
  });

  // Handle Status Update buttons inside Modal
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

  // Category Filter button clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderDashboard();
    });
  });

  // Reset Data button
  btnResetData.addEventListener('click', () => {
    if (confirm('Reset emergency data to default mock records?')) {
      resetToDefaultData();
      renderDashboard();
    }
  });

  // REAL-TIME UPDATES (Task detail: Use window.addEventListener('storage', ...))
  window.addEventListener('storage', (e) => {
    if (e.key === 'gotham_emergency_reports') {
      console.log('[Dispatcher] Real-time storage update detected!');
      renderDashboard();
    }
  });

  // Also listen for custom same-window event
  window.addEventListener('gotham_data_updated', () => {
    renderDashboard();
  });

  // Helper time formatter
  function formatTimeAgo(isoString) {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const diffMins = Math.floor((new Date() - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hr ago';
    return `${diffHours} hrs ago`;
  }

  // Security helper
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

  // Initialize
  initMap();
  renderDashboard();
});
