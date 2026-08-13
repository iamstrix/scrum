/**
 * Gotham Emergency Response System - Citizen Reporting Logic
 * Updated for Cyberpunk (Concept E) Theme
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('emergencyForm');
  const typeBtns = document.querySelectorAll('.type-btn, .cyber-btn[data-type]');
  const emergencyTypeInput = document.getElementById('emergencyType');
  const locationInput = document.getElementById('locationInput');
  const callerNotes = document.getElementById('callerNotes');
  const callerName = document.getElementById('callerName');
  const callerPhone = document.getElementById('callerPhone');
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  const feedbackBanner = document.getElementById('feedbackBanner');
  const reportIdDisplay = document.getElementById('reportIdDisplay');

  let map, pinMarker;
  const defaultLat = 40.7128;
  const defaultLng = -74.0060;

  // Cyberpunk map pin
  const customPin = L.divIcon({
    html: `
      <div style="position:relative; width:24px; height:24px;">
        <div style="position:absolute; inset:0; border:2px solid var(--cy-cyan); border-radius:50%; animation: pulseDot 1.5s infinite;"></div>
        <div style="position:absolute; top:10px; left:10px; width:4px; height:4px; background:var(--cy-magenta); border-radius:50%;"></div>
      </div>
    `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  function initPickerMap() {
    if (!document.getElementById('pickerMap')) return;

    map = L.map('pickerMap', { zoomControl: false }).setView([defaultLat, defaultLng], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'CARTO',
      maxZoom: 18
    }).addTo(map);

    pinMarker = L.marker([defaultLat, defaultLng], { draggable: true, icon: customPin }).addTo(map);
    
    map.on('click', (e) => {
      updatePinLocation(e.latlng.lat, e.latlng.lng);
    });

    pinMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      updatePinLocation(pos.lat, pos.lng);
    });
  }

  function updatePinLocation(lat, lng) {
    latInput.value = parseFloat(lat).toFixed(4);
    lngInput.value = parseFloat(lng).toFixed(4);
    if (pinMarker) {
      pinMarker.setLatLng([lat, lng]);
    }
  }

  initPickerMap();

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const chosenType = btn.getAttribute('data-type');
      emergencyTypeInput.value = chosenType;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const type = emergencyTypeInput.value || 'Police';
    const locationName = locationInput.value.trim().toUpperCase() || 'UNKNOWN';
    const notes = callerNotes.value.trim().toUpperCase();
    const name = callerName.value.trim().toUpperCase() || 'ANONYMOUS';
    const phone = callerPhone.value.trim().toUpperCase() || 'N/A';
    const lat = parseFloat(latInput.value) || defaultLat;
    const lng = parseFloat(lngInput.value) || defaultLng;

    if (!notes) {
      alert('Notes are required.');
      return;
    }

    const title = `[${type.substring(0,3)}] INCD @ ${locationName.substring(0, 15)}`;

    const reportData = {
      type: type,
      title: title,
      locationName: locationName,
      lat: lat,
      lng: lng,
      callerName: name,
      callerPhone: phone,
      notes: notes,
      severity: 'HIGH'
    };

    const saved = saveReport(reportData);

    reportIdDisplay.textContent = `ID: ${saved.id}`;
    feedbackBanner.style.display = 'block';

    // Brief glitch effect on the form
    form.style.opacity = '0.5';
    setTimeout(() => form.style.opacity = '1', 100);

    callerNotes.value = '';
    callerName.value = '';
    callerPhone.value = '';
    locationInput.value = '';

    setTimeout(() => {
      feedbackBanner.style.display = 'none';
    }, 8000);
  });
});
