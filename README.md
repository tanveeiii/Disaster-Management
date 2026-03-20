#  Disaster Management Analysis System

A full-stack application for disaster data analysis where users can upload datasets and analyze region-specific patterns using geospatial inputs.

The system combines a **React frontend** for user interaction and a **Flask backend** for data processing and analysis.

---

##  Features

-  Upload input datasets (CSV/files)
-  Enter location (latitude & longitude)
-  Radius-based filtering
-  Advanced analysis:
  - a-b value computation  
  - completeness analysis  
  - fault analysis  
-  Results displayed dynamically on UI
-  Output storage for further use

---

##  Tech Stack

###  Frontend
- React.js  
- Axios  
- HTML/CSS  

###  Backend
- Python  
- Flask  
- Pandas  
- NumPy  

---


---

##  Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/tanveeiii/Disaster-Management.git
cd Disaster-Management
```
### 2. Navigate to backend

```bash
cd backend
```

### 3. Create virtual environment

```bash
python -m venv venv
```

### 4. Activate it

WINDOWS:
```bash
venv\Scripts\activate
```

MAC/LINUX:
```bash
source venv/bin/activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Run backend server
```bash
python app.py
```

## Frontend Setup

### 7. Navigate to frontend

```bash
cd ../frontend
```
### 8. Install dependencies

```bash 
npm install
```
### 9. Start react app
```bash
npm run dev
```
