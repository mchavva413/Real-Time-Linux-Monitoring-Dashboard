import asyncio
import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connected_clients = set()
broadcast_task: Optional[asyncio.Task] = None


# ------------------------------------
# COLLECT SYSTEM METRICS
# ------------------------------------
def get_metrics():
    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_per_core = psutil.cpu_percent(interval=None, percpu=True)

    return {
        "cpu": cpu_percent,
        "cpu_per_core": cpu_per_core,
        "freq": psutil.cpu_freq().current if psutil.cpu_freq() else 0,
        "memory": dict(psutil.virtual_memory()._asdict()),
        "disk": dict(psutil.disk_usage("/")._asdict()),
        "load": psutil.getloadavg(),
    }


# ------------------------------------
# BROADCAST SYSTEM METRICS
# ------------------------------------
async def broadcast_metrics():
    while True:
        if connected_clients:
            data = get_metrics()
            dead_clients = set()

            for ws in connected_clients:
                try:
                    await ws.send_json(data)
                except WebSocketDisconnect:
                    dead_clients.add(ws)

            # remove disconnected sockets
            for ws in dead_clients:
                connected_clients.discard(ws)

        await asyncio.sleep(1)  # send data every second


# ------------------------------------
# WEBSOCKET ENDPOINT
# ------------------------------------
@app.websocket("/ws/metrics")
async def websocket_endpoint(ws: WebSocket):
    global broadcast_task

    await ws.accept()
    connected_clients.add(ws)

    # start background broadcast loop
    if broadcast_task is None or broadcast_task.done():
        broadcast_task = asyncio.create_task(broadcast_metrics())

    try:
        while True:
            await ws.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        connected_clients.discard(ws)

