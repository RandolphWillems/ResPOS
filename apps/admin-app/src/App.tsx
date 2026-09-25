import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { RestaurantTable, InventoryItem, Order } from "@respos/shared-types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const statusStyles: Record<RestaurantTable["status"], string> = {
  VRIJ: "bg-green-50 border-green-300 text-green-700",
  BESTELD: "bg-amber-50 border-amber-300 text-amber-700",
  REKENING: "bg-blue-50 border-blue-300 text-blue-700",
};

const statusLabels: Record<RestaurantTable["status"], string> = {
  VRIJ: "vrij",
  BESTELD: "besteld",
  REKENING: "rekening",
};

export default function App() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/tables`)
      .then((res) => res.json())
      .then(setTables)
      .catch(() => setTables([]));

    fetch(`${API_URL}/api/inventory/low-stock`)
      .then((res) => res.json())
      .then(setLowStock)
      .catch(() => setLowStock([]));

    // Realtime: nieuwe bestelling vanuit het klant-QR-menu ververst de tafelstatus.
    const socket = io(API_URL);
    socket.on("order:new", (order: Order) => {
      setTables((current) =>
        current.map((table) => (table.id === order.tableId ? { ...table, status: "BESTELD" } : table))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <span className="font-medium">ResPOS</span>
        <nav className="flex gap-4 text-sm text-neutral-600">
          <button>Instellingen</button>
          <button>Gebruikers</button>
        </nav>
      </header>

      <main className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
        <section className="md:col-span-2">
          <h2 className="mb-2 text-sm text-neutral-500">Tafels en bar</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`rounded-lg border px-3 py-2 ${statusStyles[table.status]}`}
              >
                <div className="font-medium">{table.label}</div>
                <div className="text-sm">{statusLabels[table.status]}</div>
              </div>
            ))}
            {tables.length === 0 && (
              <p className="col-span-full text-sm text-neutral-400">
                Nog geen tafels — voeg ze toe via Instellingen of de Prisma seed.
              </p>
            )}
          </div>
        </section>

        <aside className="rounded-lg bg-neutral-50 p-4">
          <h2 className="mb-2 text-sm text-neutral-500">Voorraad — lage stand</h2>
          <ul className="space-y-1 text-sm">
            {lowStock.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-medium text-red-600">
                  {item.currentStock} {item.unit}
                </span>
              </li>
            ))}
            {lowStock.length === 0 && <li className="text-neutral-400">Alles op peil.</li>}
          </ul>

          {/* TODO: Spotify-widget hier — zie backend/src/spotify/README.md */}
        </aside>
      </main>
    </div>
  );
}
