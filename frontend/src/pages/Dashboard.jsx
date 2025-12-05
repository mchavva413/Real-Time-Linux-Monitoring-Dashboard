import { useEffect, useState } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [cpuHistory, setCpuHistory] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/metrics");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setMetrics(data);

      setCpuHistory((prev) => [...prev.slice(-20), data.cpu]);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Real-Time Linux Monitoring Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard title="CPU Usage" value={`${metrics?.cpu.toFixed(1)}%`} />
        <MetricCard title="Memory" value={`${(metrics?.mem_used / 1024).toFixed(1)} GB / ${(metrics?.mem_total / 1024).toFixed(1)} GB`} />
        <MetricCard title="Disk Usage" value={`${metrics?.disk.toFixed(1)}%`} />
        <MetricCard title="Load Average (1/5/15)" value={metrics ? `${metrics.load1.toFixed(2)} / ${metrics.load5.toFixed(2)} / ${metrics.load15.toFixed(2)}` : "--"} />
      </div>

      {/* Live Graph */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">CPU Usage (Live)</h2>

        <svg width="600" height="200">
          {cpuHistory.map((v, i) => {
            if (i === 0) return null;
            return (
              <line
                key={i}
                x1={(i - 1) * 30}
                y1={200 - cpuHistory[i - 1] * 2}
                x2={i * 30}
                y2={200 - v * 2}
                stroke="blue"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-xl p-5">
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

