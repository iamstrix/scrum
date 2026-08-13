/**
 * Mock Data Initializer for Gotham Emergency Portal.
 * Creates an initial array of fake emergency reports and seeds them into localStorage.
 */

export const initialReports = [
  {
    id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    emergency_type: "Fire",
    location_string: "123 Amusement Mile, Gotham City",
    latitude: 40.730610,
    longitude: -73.935242,
    status: "pending",
    timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf7",
    emergency_type: "Police",
    location_string: "Crime Alley (Park Row), Gotham City",
    latitude: 40.712776,
    longitude: -74.005974,
    status: "pending",
    timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
  },
  {
    id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf8",
    emergency_type: "Medical",
    location_string: "789 Wayne Tower, Gotham City",
    latitude: 40.758896,
    longitude: -73.985130,
    status: "pending",
    timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
  }
];

const STORAGE_KEY = 'gotham_emergency_reports';

/**
 * Seeds localStorage with the initial mock reports if it is currently empty.
 */
export function initializeMockData() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data || JSON.parse(data).length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReports));
      console.log('Gotham Emergency Portal: Mock data initialized successfully.');
    }
  }
}

// Automatically initialize mock data when this file is loaded in a browser context
if (typeof window !== 'undefined') {
  initializeMockData();
}
