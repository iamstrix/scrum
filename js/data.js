/**
 * Gotham Emergency Response System - Data Initializer & LocalStorage Helper
 * Sprint Planning Task: [Data] Create Mock Data Initializer
 */

const STORAGE_KEY = 'gotham_emergency_reports';

// Initial mock dataset for Gotham City
const INITIAL_REPORTS = [
  {
    id: 'GOTH-911-8021',
    type: 'Police',
    title: 'Armed Robbery at First Gotham Bank',
    locationName: 'Crime Alley, Downtown Gotham',
    lat: 40.7128,
    lng: -74.0060,
    callerName: 'Harvey Bullock',
    callerPhone: '555-0192',
    notes: 'Masked suspects armed with automatic rifles spotted fleeing west toward the harbor in a dark sedan.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
    status: 'Reported',
    severity: 'High',
    riskScore: 12
  },
  {
    id: 'GOTH-911-8022',
    type: 'Fire',
    title: 'Chemical Tanker Explosion',
    locationName: 'Ace Chemicals Industrial Complex',
    lat: 40.7250,
    lng: -74.0150,
    callerName: 'Janice Drake',
    callerPhone: '555-0144',
    notes: 'Secondary combustion in sector 4. Toxic fumes spreading north. Fire crews requesting backup.',
    timestamp: new Date(Date.now() - 32 * 60000).toISOString(), // 32 mins ago
    status: 'Dispatched',
    severity: 'Critical',
    riskScore: 5
  },
  {
    id: 'GOTH-911-8023',
    type: 'Medical',
    title: 'Mass Dehydration & Collapse',
    locationName: 'The Narrows Residential Block B',
    lat: 40.7050,
    lng: -73.9950,
    callerName: 'Dr. Leslie Thompkins',
    callerPhone: '555-0178',
    notes: 'Multiple citizens showing acute respiratory distress. Ambulance units dispatch requested immediately.',
    timestamp: new Date(Date.now() - 50 * 60000).toISOString(), // 50 mins ago
    status: 'Dispatched',
    severity: 'High',
    riskScore: 8
  }
];

// Initialize localStorage if empty
function initMockData() {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
    console.log('[Gotham 911] Mock emergency reports loaded into localStorage.');
  }
}

// Get all reports from localStorage
function getReports() {
  initMockData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading reports from localStorage:', e);
    return INITIAL_REPORTS;
  }
}

// Save a new emergency report to localStorage
function saveReport(newReport) {
  const reports = getReports();
  // Ensure timestamp and ID exist
  if (!newReport.id) {
    newReport.id = 'GOTH-911-' + Math.floor(1000 + Math.random() * 9000);
  }
  if (!newReport.timestamp) {
    newReport.timestamp = new Date().toISOString();
  }
  if (!newReport.status) {
    newReport.status = 'Reported';
  }
  if (!newReport.riskScore) {
    newReport.riskScore = Math.floor(Math.random() * 20); // Low risk default for genuine reports
  }

  // Unshift so newest appears first
  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

  // Trigger custom event for same-window updates
  window.dispatchEvent(new Event('gotham_data_updated'));
  return newReport;
}

// Update report status
function updateReportStatus(reportId, newStatus) {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports[index].status = newStatus;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    window.dispatchEvent(new Event('gotham_data_updated'));
    return reports[index];
  }
  return null;
}

// Reset mock data helper
function resetToDefaultData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
  window.dispatchEvent(new Event('gotham_data_updated'));
  return INITIAL_REPORTS;
}

// Auto-run init
initMockData();
