
export type Tab = 'dashboard' | 'items' | 'new-stocks' | 'sales' | 'purchase' | 'report' | 'settings';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  stock: number;
  unitCost: number;
  sellingPrice: number;
  stockAlertLevel?: number;
  remarks?: string;
  dateAdded: string;
}

export interface Transaction {
  id: string;
  batchId?: string; // Groups multiple items in one sale/purchase
  date: string;
  type: 'sale' | 'purchase' | 'opening';
  itemId: string;
  quantity: number;
  unitPrice: number;
  remarks?: string;
}

export interface UserSettings {
  currency: string;
  locale: string;
  dateFormat: string;
  email: string;
}

export interface AppState {
  items: Item[];
  transactions: Transaction[];
  settings: UserSettings;
}