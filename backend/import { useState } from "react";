import { useState } from "react";
import { FiHome, FiCpu, FiHardDrive, FiBarChart2, FiMenu } from "react-icons/fi";

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", icon: <FiHome />, href: "/" },
    { name: "CPU", icon: <FiCpu />, href: "/cpu" },
    { name: "Memory", icon: <FiHardDrive />, href: "/memory" },
    { name: "Analytics", icon: <FiBarChart2 />, href: "/analytics" }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      
      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 shadow-lg p-4 transition-all duration-300 ${open ? "w-64" : "w-20"}`}>
        <button onClick={() => setOpen(!open)} className="text-2xl mb-5">
          <FiMenu />
        </button>

        <nav className="space-y-3">
          {menu.map((item) => (
            <a key={item.name} href={item.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <span className="text-xl">{item.icon}</span>
              {open && <span className="font-medium">{item.name}</span>}
            </a>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

