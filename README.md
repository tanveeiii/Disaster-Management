# Seismic Analyzer — PSHA & Hazard Analysis Platform

A full-stack web application for **Probabilistic Seismic Hazard Analysis (PSHA)** of sites in India. Upload an earthquake catalog, configure site parameters, and get a complete hazard analysis — including Gutenberg–Richter regression, fault filtering, declustering, completeness analysis, and a site-specific seismic hazard curve.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
  - [Backend (Flask)](#1-backend-flask)
  - [Frontend (React)](#2-frontend-react)
- [Running the Application](#running-the-application)
- [How to Use](#how-to-use)
- [Input File Format](#input-file-format)
- [Analysis Pipeline](#analysis-pipeline)
- [API Reference](#api-reference)
- [Output & Results](#output--results)

---

## Overview

The Seismic Analyzer automates the PSHA workflow used in geotechnical and structural engineering to estimate the likelihood of ground shaking at a specific site. Given an earthquake catalog and a target location, it:

1. Loads and deduplicates historical earthquake data
2. Loads Indian fault data from the SEISAT database
3. Filters earthquakes relevant to local faults
4. Declusters the catalog (removes aftershocks)
5. Performs Gutenberg–Richter regression
6. Runs Stepp completeness analysis
7. Computes fault activity rates and weights
8. Generates a full PSHA hazard curve and MARE table

---

## Features

- **Excel catalog upload** with drag-and-drop support
- **Interactive India Fault Map** (Folium/Leaflet) with color-coded fault types
- **Gutenberg–Richter curve** (a-value, b-value, R²)
- **Catalog processing** — deduplication, magnitude conversion to Mw, spatial filtering
- **Gardner–Knopoff declustering** to isolate mainshocks
- **Stepp completeness analysis** with chart
- **Fault metrics** — lengths, earthquake weights, activity rates (α)
- **Seismic hazard curve** with power-law fit
- **MARE table** — PGA values for multiple return periods (475yr, 2475yr, etc.)
- **Excel export** of full PSHA calculation sheets
- Real-time toast notifications for errors and progress

---

## Project Structure

```
├── backend/
│   ├── handlers/                    # Request handler modules
│   ├── outputs/                     # Generated Excel PSHA output files
│   ├── routes/                      # Flask route definitions
│   ├── services/                    # Business logic services
│   ├── utils/                       # Utility/helper functions
│   ├── venv/                        # Python virtual environment
│   ├── analysis_utils.py            # Core PSHA analysis pipeline
│   ├── app.py                       # Flask application entry point
│   ├── entire_india_faults.html     # Pre-generated interactive fault map
│   ├── India_Faults_Combined.csv    # SEISAT fault database (required)
│   ├── plotMap.py                   # Script to regenerate the fault map
│   └── requirements.txt             # Python dependencies
│
└── frontend1/
    ├── node_modules/                # JS dependencies (auto-generated)
    ├── public/                      # Static assets
    ├── src/                         # React source code
    │   └── App.jsx                  # Main application component
    └── .gitignore
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Axios, Lucide React, React-Toastify |
| Backend | Python 3.x, Flask, Flask-CORS |
| Geospatial | GeoPandas, Shapely, Folium |
| Scientific | NumPy, SciPy, pandas, matplotlib |
| Distance | geopy |
| Excel I/O | openpyxl |
| Map | Folium (Leaflet.js wrapper) |

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

- **Python** 3.9 or higher → [python.org](https://www.python.org/downloads/)
- **Node.js** 18 or higher + npm → [nodejs.org](https://nodejs.org/)
- **Git** (optional, for cloning)

Verify installations:
```bash
python --version
node --version
npm --version
```

---

## Setup & Installation

### 1. Backend (Flask)

**Step 1 — Navigate to the backend folder:**
```bash
cd backend
```

**Step 2 — Create and activate a virtual environment:**

On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

On macOS/Linux:
```bash
python -m venv venv
source venv/bin/activate
```

You should see `(venv)` appear in your terminal prompt.

**Step 3 — Install Python dependencies:**
```bash
pip install -r requirements.txt
```


**Step 4 — Verify the fault data file is present:**

Make sure `India_Faults_Combined.csv` exists in the `backend/` directory. This file is required for all analysis — the app will throw a `FileNotFoundError` without it.

**Step 5 — (Optional) Regenerate the fault map:**

The `entire_india_faults.html` file is pre-generated and committed to the repo. If you need to regenerate it (e.g., after updating the CSV):
```bash
python plotMap.py
```
This will overwrite `entire_india_faults.html` in the backend folder.

---

### 2. Frontend (React)

**Step 1 — Navigate to the frontend folder:**
```bash
cd frontend1
```

**Step 2 — Install JavaScript dependencies:**
```bash
npm install
```

---

## Running the Application

You need **two terminals running simultaneously** — one for the backend, one for the frontend.

### Terminal 1 — Start the Flask backend:
```bash
cd backend
venv\Scripts\activate       # Windows
# or: source venv/bin/activate  # macOS/Linux

python app.py
```

Flask will start on **http://127.0.0.1:5000**

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Terminal 2 — Start the React frontend:
```bash
cd frontend1
npm run dev
```

The app will be available at **http://localhost:5173** (or the port shown in your terminal).

> Both servers must be running for the app to work. The frontend calls the backend at `http://127.0.0.1:5000`.

---

## How to Use

1. **Open** `http://localhost:5173` in your browser
2. **Upload** your earthquake catalog Excel file (`.xlsx` or `.xls`, max 50 MB)
3. **Enter site parameters:**
   - **Center Latitude / Longitude** — the geographic center of your study area
   - **Radius (km)** — search radius for earthquakes and faults (default: 300 km)
   - **Decluster Distance (km)** — minimum separation between mainshocks (default: 50 km)
   - **Fault Buffer (km)** — buffer zone around faults to filter earthquakes (default: 15 km)
   - **Site Latitude / Longitude** — the exact PSHA computation point (defaults to center if left blank)
   - **End Year** — the year your catalog ends (e.g., 2020)
4. **Click "Run Analysis"** — this may take 2–5 minutes depending on catalog size
5. **Browse results** using the sidebar navigation
6. **Download** the full PSHA Excel workbook using the "Download Excel" button

**To view the fault map**, click "View India Fault Map" on the home screen or in the sidebar.

---

## Input File Format

Your Excel file must have the following columns in the **first sheet** (column names are case-insensitive):

| Column | Description | Example |
|---|---|---|
| `year` | Year of the event | 2001 |
| `month` | Month (1–12) | 1 |
| `date` | Day of month | 26 |
| `hours` | Hour (UTC) | 3 |
| `minutes` | Minutes | 16 |
| `latitude` | Epicenter latitude (decimal degrees) | 23.40 |
| `longitude` | Epicenter longitude (decimal degrees) | 70.23 |
| `magnitude` | Magnitude value | 7.7 |
| `mag type` | Magnitude scale (`Mw`, `mb`, `Ms`, `ML`, `M`) | Mw |

> Extra columns are ignored. Rows with missing latitude, longitude, or magnitude are dropped automatically.

### Magnitude Conversion

All magnitudes are internally converted to **moment magnitude (Mw)** using these relations:

| Scale | Formula |
|---|---|
| mb | Mw = 0.85·mb + 1.03 |
| Ms | Mw = 0.67·Ms + 2.07 |
| ML | Mw = 0.85·ML + 0.60 |
| Mw / M | No conversion needed |

---

## Analysis Pipeline

```
Excel Upload
    │
    ▼
1. Preprocess       → Read first sheet, convert magnitudes to Mw
    │
    ▼
2. Deduplicate      → Remove events with identical time + location
    │
    ▼
3. Fault Loading    → Load India_Faults_Combined.csv (SEISAT)
    │
    ▼
4. Fault Filter     → Keep only faults within user-defined radius
    │
    ▼
5. EQ Filter        → Keep earthquakes within fault buffer zone
    │
    ▼
6. Decluster        → Gardner–Knopoff: keep mainshocks only
    │
    ▼
7. G-R Analysis     → Compute yearly/cumulative counts, fit log₁₀(N) = a - b·M
    │
    ▼
8. Completeness     → Stepp method: λ and σ per magnitude band per period
    │
    ▼
9. Fault Metrics    → Length, Num_EQ, Wm, Wl, weightage, revised α
    │
    ▼
10. PSHA Loop       → For each fault × each z (0.01g–0.36g): compute µ(z)
    │
    ▼
11. Hazard Curve    → Power-law fit to µ(z) vs PGA
    │
    ▼
12. MARE Table      → PGA for 8 return period scenarios
```

---

## API Reference

### `POST /analyze`

Runs the full PSHA pipeline.

**Form data parameters:**

| Field | Type | Description |
|---|---|---|
| `file` | File | Excel earthquake catalog |
| `latitude` | float | Center latitude |
| `longitude` | float | Center longitude |
| `radius` | float | Search radius in km |
| `decluster_km` | float | Declustering distance in km |
| `buffer_km` | float | Fault buffer distance in km |
| `x_coord` | float | Site latitude for PSHA (optional) |
| `y_coord` | float | Site longitude for PSHA (optional) |
| `start_year` | int | End year of catalog |

**Response:** JSON with analysis results, base64-encoded plots, and table data.

---

### `GET /download-excel`

Downloads the generated PSHA Excel workbook from `outputs/fault_output.xlsx`.

---

### `GET /map`

Serves the pre-generated `entire_india_faults.html` interactive fault map.

---

## Output & Results

| Section | Description |
|---|---|
| **Overview** | a-value, b-value, R², event counts at each pipeline stage |
| **GR Curve** | Gutenberg–Richter log₁₀(N) vs Magnitude plot |
| **Compiled Catalog** | First 50 rows after deduplication |
| **Filtered Catalog** | First 50 rows after fault buffer filter |
| **Declustered** | First 50 rows after aftershock removal |
| **Yearly Magnitude** | Event counts per year per magnitude band |
| **Cumulative Counts** | Cumulative G-R table |
| **A-B PSHA Table** | M_avg, N_cumulative, N, logN |
| **Completeness** | Stepp table: λ and σ per period per band |
| **Fault Metrics** | Length, weights, revised α per fault |
| **PSHA Summary** | Total µ(z) and return period for PGA 0.01–0.36g |
| **MARE Table** | PGA for 10%/2% exceedance in 50/100/500/1000 years |
| **Hazard Curve** | Mean annual exceedance rate vs PGA (log scale) |

---

