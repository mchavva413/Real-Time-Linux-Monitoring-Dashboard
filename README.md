# 🖥️ Real-Time Linux Monitoring Dashboard  
A full-stack real-time system monitoring dashboard built using **FastAPI**, **WebSockets**, **Python (psutil)**, **React**, and **TailwindCSS**.  
This project streams live CPU, memory, disk, and load metrics from the backend to the frontend without page refresh.

---

## 🚀 Features

### 🔧 **Backend (FastAPI + WebSockets)**
- Real-time system metrics using `psutil`
- WebSocket endpoint for continuous streaming (`/ws/metrics`)
- CPU, Memory, Disk Usage, and Load Average
- Lightweight and extremely fast (built with FastAPI)
- Easy to deploy

### 🎨 **Frontend (React + Vite + TailwindCSS)**
- Dashboard showing real-time graphs and stats
- Dedicated pages for:
  - **CPU Details**
  - **Memory Details**
  - **Analytics (chart section placeholder)**
- Smooth UI layout built with TailwindCSS
- Auto-reconnecting WebSocket client (no UI flicker)


## 🏗️ Tech Stack

### **Backend**
- Python 3.9+
- FastAPI
- WebSockets
- psutil

### **Frontend**
- React (Vite)
- TailwindCSS
- Axios (optional)

### 🧪 Future Enhancements

Add historical charts (CPU, memory trends)

Add user authentication

Dockerize backend + frontend

Add process viewer (top-like)

Export metrics to a database
