# 🚨 Gotham City 911 Emergency Response System (Prototype)

A fully client-side emergency reporting and dispatch dashboard prototype for Gotham City. Designed to run **100% statically on GitHub Pages** with zero backend server dependencies.

It uses browser `localStorage` to simulate a database and the browser's native `storage` event to sync emergency reports from the Citizen portal to the Dispatcher Dashboard in **real-time** across different browser tabs.

---

## 📂 Project Structure

* **[index.html](file:///c:/dev/Antigravity/scrum/index.html)**: The Citizen Portal where reports are submitted. Includes a Leaflet.js location picker.
* **[dispatcher.html](file:///c:/dev/Antigravity/scrum/dispatcher.html)**: The Dispatcher Dashboard featuring an active incidents list and a real-time Leaflet.js map pinning reports.
* **[css/styles.css](file:///c:/dev/Antigravity/scrum/css/styles.css)**: Sleek, high-contrast dark theme stylesheet (GCPD styled).
* **[js/data.js](file:///c:/dev/Antigravity/scrum/js/data.js)**: Handles mock data initialization (seeds 3 reports on first load), reading from `localStorage`, and saving/updating reports.
* **[js/citizen.js](file:///c:/dev/Antigravity/scrum/js/citizen.js)**: Logic for the citizen page form validation, coordinate capturing, and map marker positioning.
* **[js/dispatcher.js](file:///c:/dev/Antigravity/scrum/js/dispatcher.js)**: Logic for the dispatcher dashboard list, Leaflet map renders, and real-time cross-tab auto-refresh.

---

## 📋 Database Schema (localStorage)

Reports are stored in the `localStorage` key `'gotham_emergency_reports'` as an array of JSON objects structured as follows:

```json
{
  "id": "GOTH-911-8021",
  "type": "Police",
  "title": "Armed Robbery at First Gotham Bank",
  "locationName": "Crime Alley, Downtown Gotham",
  "lat": 40.7128,
  "lng": -74.0060,
  "callerName": "Harvey Bullock",
  "callerPhone": "555-0192",
  "notes": "Suspects armed with automatic rifles spotted fleeing west.",
  "timestamp": "2026-08-13T10:30:00.000Z",
  "status": "Reported",
  "severity": "High",
  "riskScore": 12
}
```

---

## 🔬 Testing the Prototype Locally

To run the application on your computer:
1. Open the project folder.
2. Open **[index.html](file:///c:/dev/Antigravity/scrum/index.html)** in a browser tab (Citizen Portal).
3. Open **[dispatcher.html](file:///c:/dev/Antigravity/scrum/dispatcher.html)** in a *second* browser tab (Dispatcher Dashboard).
4. Fill out and submit an emergency in the Citizen tab.
5. Switch to the Dispatcher tab—the report list will update and a new marker will appear on the map in **real-time** without requiring any page reload!

---

## 🚀 GitHub Pages Deployment Steps

1. **Commit and Push**: Ensure all files are pushed to your GitHub repository.
2. **Enable Pages**:
   * Go to your repository on GitHub.
   * Click **Settings** (top navigation tab).
   * Click **Pages** (left sidebar).
   * Under **Build and deployment**, set the source to **Deploy from a branch**.
   * Select your branch (e.g. `main` or `deploy`) and folder (`/root`), then click **Save**.
3. **Access**: The site will be published at `https://<github-username>.github.io/<repository-name>/index.html` in 1–2 minutes.

> [!WARNING]
> **Relative Paths Requirement**  
> Since GitHub Pages projects are hosted in a subfolder (e.g., `/scrum/`), all CSS, image, and JS references must use relative paths (e.g., `./js/data.js` or `js/data.js` instead of `/js/data.js`). This is already handled in this prototype code!
