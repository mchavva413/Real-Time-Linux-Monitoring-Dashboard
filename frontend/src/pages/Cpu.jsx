// CPU.jsx (FINAL — No blinking, stable WebSocket)
import { useEffect, useState } from "react";

export default function CPU() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let ws;

    function connectWS() {
      ws = new WebSocket("ws://localhost:8000/ws/metrics");

      ws.onopen = () => {
        console.log("CPU Page WebSocket Connected");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMetrics(data);  // ⭐ No blinking — only updates the state normally
      };

      ws.onclose = () => {
        console.log("CPU WS closed — reconnecting…");
        setTimeout(connectWS, 1000); // ⭐ Reconnect WITHOUT reloading page
      };
    }

    connectWS();
    return () => ws && ws.close();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">CPU Details</h1>

      {/* TOTAL CPU */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <p className="text-gray-600 font-semibold">Total CPU Usage</p>
        <h2 className="text-4xl font-bold mt-2">
          {metrics ? `${metrics.cpu.toFixed(1)}%` : "--"}
        </h2>

        <p className="text-gray-500 mt-2">
          Frequency: {metrics ? `${metrics.cpu_freq.toFixed(0)} MHz` : "--"}
        </p>
      </div>

      {/* PER CORE USAGE */}
      <h2 className="text-2xl font-semibold mb-4">Per-Core Usage</h2>

      <div className="grid grid-cols-4 gap-6">
        {metrics?.per_core &&
          metrics.per_core.map((value, index) => (
            <div key={index} className="bg-white shadow rounded-xl p-4">
              <p className="text-gray-600 font-medium mb-2">Core {index}</p>

              <div className="h-20 w-full bg-gray-200 rounded relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 bg-blue-500"
                  style={{ height: `${value}%`, width: "100%" }}
                ></div>
              </div>

              <p className="text-center font-semibold mt-2">{value.toFixed(1)}%</p>
            </div>
          ))}
      </div>
    </div>
  );
}

