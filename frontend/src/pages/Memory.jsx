import { useEffect, useState } from "react";

export default function Memory() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/metrics");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMetrics(data);

      const usedGB = data.memory.used / 1024 / 1024 / 1024;

      setHistory((prev) => {
        const next = [...prev, usedGB];
        if (next.length > 40) next.shift();
        return next;
      });
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Memory Details</h1>

      {metrics ? (
        <>
          <div className="bg-white p-5 rounded-xl shadow mb-6">
            <h2 className="text-xl font-semibold">Memory Usage</h2>
            <p className="text-2xl font-bold mt-2">
              {(metrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB /{" "}
              {(metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
            </p>
          </div>

          {/* Memory graph */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Memory Usage (Live)</h2>

            <div className="h-48 border rounded-lg flex items-end">
              {history.map((value, idx) => (
                <div
                  key={idx}
                  className="bg-green-500"
                  style={{
                    height: `${(value / 16) * 100}%`,
                    width: "4px",
                    marginRight: "2px",
                  }}
                ></div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

