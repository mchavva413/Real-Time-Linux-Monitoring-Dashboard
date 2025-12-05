import { useEffect, useState } from "react";

export default function Analytics() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/metrics");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setHistory((prev) => {
        const next = [...prev, data];
        if (next.length > 50) next.shift();
        return next;
      });
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold">Live Metrics History</h2>

        <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-auto h-64">
          {JSON.stringify(history, null, 2)}
        </pre>
      </div>
    </div>
  );
}

