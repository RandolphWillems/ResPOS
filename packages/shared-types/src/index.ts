export type TableZone = "TAFEL" | "BAR";
export type TableStatus = "VRIJ" | "BESTELD" | "REKENING";

export interface RestaurantTable {
  id: string;
  label: string;
  zone: TableZone;
  status: TableStatus;
  qrToken: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
}

export type OrderStatus = "OPEN" | "BESTELD" | "KLAAR" | "OP_REKENING" | "AFGEREKEND";

export interface OrderLine {
  id: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  price: number;
  note?: string | null;
}

export interface Order {
  id: string;
  tableId: string;
  status: OrderStatus;
  total: number;
  lines: OrderLine[];
  createdAt: string;
}

export type InventoryCategory = "KEUKEN" | "DRANK" | "WIJN" | "OVERIG";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
}
