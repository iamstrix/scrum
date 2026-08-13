/**
 * Gotham Emergency Response System - Citizen Reporting Logic
 * Handles User Story 1: Emergency Reporting (Citizen Side)
 */

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const form = document.getElementById('emergencyForm');
  const typeBtns = document.querySelectorAll('.type-btn');
  const emergencyTypeInput = document.getElementById('emergencyType');
  const locationInput = document.getElementById('locationInput');
  const callerNotes = document.getElementById('callerNotes');
  const callerName = document.getElementById('callerName');
  const callerPhone = document.getElementById('callerPhone');
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  const feedbackBanner = document.getElementById('feedbackBanner');
  const reportIdDisplay = document.getElementById('reportIdDisplay');
  const dispLat = document.getElementById('dispLat');
  const dispLng = document.getElementById('dispLng');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Initialize Leaflet Location Picker Map
  let map, pinMarker;
  const defaultLat = 40.7128;
  const defaultLng = -74.0060;

  function initPickerMap() {
    if (!document.getElementById('pickerMap')) return;

    // Dark Matter CartoDB tiles
    map = L.map('pickerMap').setView([defaultLat, defaultLng], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> Gotham GIS',
      maxZoom: 18
    }).addTo(map);

    // Initial marker
    pinMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    pinMarker.bindPopup('<b>Emergency Location Pin</b><br>Drag or click map to change.').openPopup();

    // Map click event
    map.on('click', (e) => {
      updatePinLocation(e.latlng.lat, e.latlng.lng);
    });

    // Marker drag end event
    pinMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      updatePinLocation(pos.lat, pos.lng);
    });
  }

  function updatePinLocation(lat, lng) {
    const fixedLat = parseFloat(lat).toFixed(4);
    const fixedLng = parseFloat(lng).toFixed(4);

    latInput.value = fixedLat;
    lngInput.value = fixedLng;
    dispLat.textContent = fixedLat;
    dispLng.textContent = fixedLng;

    if (pinMarker) {
      pinMarker.setLatLng([lat, lng]);
    }
  }

  initPickerMap();

  // Handle Emergency Type selection buttons
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const chosenType = btn.getAttribute('data-type');
      emergencyTypeInput.value = chosenType;
    });
  });

  // Handle Preset Gotham Landmarks chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const name = chip.getAttribute('data-name');
      const lat = parseFloat(chip.getAttribute('data-lat'));
      const lng = parseFloat(chip.getAttribute('data-lng'));

      locationInput.value = name;
      updatePinLocation(lat, lng);
      if (map) {
        map.panTo([lat, lng]);
      }
    });
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const type = emergencyTypeInput.value || 'Police';
    const locationName = locationInput.value.trim() || 'Unspecified Gotham Sector';
    const notes = callerNotes.value.trim();
    const name = callerName.value.trim() || 'Anonymous Citizen';
    const phone = callerPhone.value.trim() || 'N/A';
    const lat = parseFloat(latInput.value) || defaultLat;
    const lng = parseFloat(lngInput.value) || defaultLng;

    if (!notes) {
      alert('Please provide notes describing the emergency situation.');
      return;
    }

    // Generate title from type and location
    const title = `${type} Incident near ${locationName.split(',')[0]}`;

    // Create report object
    const reportData = {
      type: type,
      title: title,
      locationName: locationName,
      lat: lat,
      lng: lng,
      callerName: name,
      callerPhone: phone,
      notes: notes,
      severity: 'High'
    };

    // Save to localStorage via data.js helper
    const saved = saveReport(reportData);

    // Show visual feedback
    reportIdDisplay.textContent = `REPORT ID: ${saved.id}`;
    feedbackBanner.classList.add('show');

    // Scroll to feedback banner smoothly
    feedbackBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Clear form inputs as required by task details
    callerNotes.value = '';
    callerName.value = '';
    callerPhone.value = '';
    locationInput.value = '';

    // Auto hide success feedback after 8 seconds
    setTimeout(() => {
      feedbackBanner.classList.remove('show');
    }, 8000);
  });
});
