/**
 * Mock Backend Client for Static Frontend Deployments (e.g. GitHub Pages).
 * Persists data to localStorage and uses BroadcastChannel for tab-to-tab real-time alerts.
 * 
 * Your teammate can copy and import this file directly into the frontend project.
 */

import { initialReports } from './data.js';

const STORAGE_KEY = 'gotham_emergency_reports';
const CHANNEL_NAME = 'gotham_emergency_alerts';

// Helper to safely initialize localStorage if running in a browser environment
function getLocalStorageData() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data || JSON.parse(data).length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReports));
    return initialReports;
  }
  return JSON.parse(data);
}

// Safe check for window environment
const isBrowser = typeof window !== 'undefined';

// Instantiate BroadcastChannel for real-time tab communication
let alertChannel = null;
if (isBrowser && typeof BroadcastChannel !== 'undefined') {
  try {
    alertChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel is not supported or accessible in this environment.', e);
  }
}

// Active subscription callbacks for real-time notifications
const activeCallbacks = new Set();

// Listen for messages from other tabs
if (alertChannel) {
  alertChannel.onmessage = (event) => {
    const { type, data } = event.data;
    if (type === 'new_report') {
      activeCallbacks.forEach(cb => {
        try { cb(data); } catch (e) { console.error('Error in alert callback:', e); }
      });
    }
  };
}

// Cross-tab fallback using the standard 'storage' event listener
if (isBrowser) {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      const oldList = JSON.parse(event.oldValue || '[]');
      const newList = JSON.parse(event.newValue);
      
      // If a new emergency is added, trigger callback for the new items
      if (newList.length > oldList.length) {
        const newItems = newList.filter(item => !oldList.some(old => old.id === item.id));
        newItems.forEach(newItem => {
          activeCallbacks.forEach(cb => {
            try { cb(newItem); } catch (e) { console.error('Error in alert callback:', e); }
          });
        });
      }
    }
  });
}

export const mockBackend = {
  /**
   * Retrieves all active/pending emergency reports from localStorage.
   * @returns {Promise<Array>} List of active/pending reports.
   */
  async getReports() {
    // Simulate small network delay for realistic integration
    await new Promise(resolve => setTimeout(resolve, 300));
    const all = getLocalStorageData();
    // Return only active/pending reports as specified in the checklist
    return all.filter(item => item.status === 'pending' || item.status === 'active')
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  /**
   * Retrieves full details of a specific emergency report by ID.
   * @param {string} id - The ID of the emergency.
   * @returns {Promise<Object|null>} The emergency details or null.
   */
  async getReportById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = getLocalStorageData();
    return list.find(item => item.id === id) || null;
  },

  /**
   * Reports a new emergency. Saves it to localStorage and broadcasts the alert.
   * @param {Object} reportData - The report details.
   * @param {string} reportData.type - Fire, Police, or Medical (maps to emergency_type).
   * @param {string} reportData.location - Location string (maps to location_string).
   * @param {number} [reportData.latitude] - Latitude coordinate.
   * @param {number} [reportData.longitude] - Longitude coordinate.
   * @returns {Promise<Object>} The created emergency report database structure.
   */
  async reportEmergency(reportData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Validate fields (mimicking Express validation)
    const validTypes = ['Fire', 'Police', 'Medical'];
    if (!reportData.type || !validTypes.includes(reportData.type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }
    if (!reportData.location || reportData.location.trim() === '') {
      throw new Error('Location is required.');
    }

    const list = getLocalStorageData();
    
    const newReport = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      emergency_type: reportData.type,
      location_string: reportData.location.trim(),
      latitude: reportData.latitude !== undefined && reportData.latitude !== null ? Number(reportData.latitude) : null,
      longitude: reportData.longitude !== undefined && reportData.longitude !== null ? Number(reportData.longitude) : null,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    list.push(newReport);
    
    if (isBrowser && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    // Fire callbacks in the reporting tab immediately
    activeCallbacks.forEach(cb => {
      try { cb(newReport); } catch (e) { console.error('Error in alert callback:', e); }
    });

    // Broadcast to other tabs running the frontend
    if (alertChannel) {
      alertChannel.postMessage({
        type: 'new_report',
        data: newReport
      });
    }

    return newReport;
  },

  /**
   * Subscribes to real-time emergency reports.
   * @param {Function} callback - Callback function invoked with the new emergency report.
   * @returns {Function} Unsubscribe function to clean up the listener.
   */
  subscribeToAlerts(callback) {
    activeCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      activeCallbacks.delete(callback);
    };
  }
};
