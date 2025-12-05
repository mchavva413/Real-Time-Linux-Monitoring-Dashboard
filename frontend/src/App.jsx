// frontend/src/App.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

// --------------------
// Metrics Context
// --------------------
const MetricsContext = createContext({ metrics: null, cpuHistory: [] });

export function useMetrics() {
  return useContext(MetricsContext);
}

// --------------------
// Dashboard Page
// --------------------
function Dashboard() {
  const { metrics, cpuHistory } = useMetrics();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Real-Time Linux Monitoring Dashboard</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="CPU Usage" value={metrics ? `${metrics.cpu.toFixed(1)}%` : "--"} />

        <StatCard
          title="Memory"
          value={
            metrics
              ? `${(metrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / ${(metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB`
              : "--"
          }
        />

        <StatCard
          title="Disk Usage"
          value={metrics ? `${metrics.disk.percent.toFixed(1)}%` : "--"}
        />

        <StatCard
          title="Load Average (1/5/15)"
          value={
            metrics
              ? `${metrics.load[0].toFixed(2)} / ${metrics.load[1].toFixed(2)} / ${metrics.load[2].toFixed(2)}`
              : "--"
          }
        />
      </div>

      {/* CPU Graph */}
      <div className="mt-10 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">CPU Usage (Live)</h2>

        <div className="h-48 border rounded-lg flex items-end overflow-hidden px-3">
          {cpuHistory.length === 0 ? (
            <div className="text-gray-400">Waiting for data…</div>
          ) : (
            cpuHistory.map((value, idx) => (
              <div
                key={idx}
                className="bg-blue-500"
                style={{
                  height: `${Math.max(1, value)}%`,
                  width: "6px",
                  marginRight: "4px",
                  borderRadius: "2px",
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --------------------
// Stat Card
// --------------------
function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

// --------------------
// CPU Page
// --------------------
function CPU() {
  const { metrics } = useMetrics();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">CPU Details</h1>
      <div className="mt-6 bg-white rounded-xl p-6 shadow">
        <p className="text-gray-500">Total CPU Usage</p>
        <p className="text-4xl font-bold">{metrics ? `${metrics.cpu.toFixed(1)}%` : "--"}</p>
        <p className="text-sm text-gray-600 mt-2">
          Frequency: {metrics && metrics.cpu_freq_mhz ? `${metrics.cpu_freq_mhz.toFixed(0)} MHz` : "N/A"}
        </p>
      </div>

      <h2 className="mt-8 text-xl font-semibold">Per-Core Usage</h2>
      <div className="grid grid-cols-4 gap-6 mt-4">
        {metrics && metrics.per_cpu
          ? metrics.per_cpu.map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow">
                <div className="text-sm text-gray-500">Core {i}</div>
                <div className="h-20 bg-gray-200 rounded mt-3 flex items-end">
                  <div
                    className="bg-blue-500 w-full rounded-b"
                    style={{ height: `${Math.max(2, p)}%` }}
                  />
                </div>
                <div className="text-center font-bold mt-3">{p.toFixed(1)}%</div>
              </div>
            ))
          : <div className="text-gray-500">No per-core data yet.</div>}
      </div>
    </div>
  );
}

// --------------------
// Memory Page
// --------------------
function Memory() {
  const { metrics } = useMetrics();
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Memory Details</h1>
      <div className="mt-6 bg-white rounded-xl p-6 shadow">
        {metrics ? (
          <>
            <div className="text-gray-500">Used / Total</div>
            <div className="text-2xl font-bold">
              {(metrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB /{" "}
              {(metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
            </div>
          </>
        ) : (
          <div className="text-gray-500">Waiting for data…</div>
        )}
      </div>
    </div>
  );
}

// --------------------
// Analytics Page
// --------------------
function Analytics() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="mt-3 text-gray-600">Charts & analytics coming soon.</p>
    </div>
  );
}

// --------------------
// App (Metrics provider + Router)
// --------------------
export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    let ws;
    let reconnectTimeout = 1000;

    function connect() {
      ws = new WebSocket("ws://localhost:8000/ws/metrics");

      ws.onopen = () => {
        console.log("WS connected");
        setWsConnected(true);
        reconnectTimeout = 1000; // reset backoff
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          setMetrics(data);

          setCpuHistory((prev) => {
            const next = [...prev, data.cpu];
            if (next.length > 60) next.shift();
            return next;
          });
        } catch (err) {
          console.error("Invalid JSON from ws:", err);
        }
      };

      ws.onclose = () => {
        console.log("WS closed, will reconnect in", reconnectTimeout, "ms");
        setWsConnected(false);
        setTimeout(connect, reconnectTimeout);
        reconnectTimeout = Math.min(30000, reconnectTimeout * 1.5);
      };

      ws.onerror = (err) => {
        console.warn("WS error", err);
        ws.close();
      };
    }

    connect();

    return () => {
      try {
        ws && ws.close();
      } catch (e) {}
    };
  }, []);

  const contextValue = { metrics, cpuHistory, wsConnected };

  return (
    <MetricsContext.Provider value={contextValue}>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cpu" element={<CPU />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </MetricsContext.Provider>
  );
}

