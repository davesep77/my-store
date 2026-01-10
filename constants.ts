
import { Item, Transaction, UserSettings } from './types';

export const INITIAL_SETTINGS: UserSettings = {
  currency: 'GBP',
  locale: 'en-GB',
  dateFormat: 'DD/MM/YYYY',
  email: 'admin@mystore.com'
};

export const INITIAL_ITEMS: Item[] = [
  { id: '11', sku: 'WC-001', name: 'Wall Clock', stock: 15, unitCost: 600, sellingPrice: 850, stockAlertLevel: 5, remarks: 'Silent, 12-inch', dateAdded: '2024-01-10' },
  { id: '10', sku: 'EP-002', name: 'Earphones', stock: 45, unitCost: 150, sellingPrice: 280, stockAlertLevel: 10, remarks: 'Wired, 3.5mm', dateAdded: '2024-01-15' },
  { id: '9', sku: 'DO-003', name: 'Desk Organizer', stock: 32, unitCost: 400, sellingPrice: 580, stockAlertLevel: 5, remarks: 'Wooden, 5 slots', dateAdded: '2024-02-05' },
  { id: '8', sku: 'PC-004', name: 'Phone Charger', stock: 55, unitCost: 200, sellingPrice: 350, stockAlertLevel: 15, remarks: '20W, USB-C', dateAdded: '2024-02-12' },
  { id: '7', sku: 'BP-005', name: 'Ballpoint Pens', stock: 180, unitCost: 50, sellingPrice: 95, stockAlertLevel: 20, remarks: 'Pack of 10', dateAdded: '2024-03-01' },
  { id: '6', sku: 'BK-006', name: 'Backpack', stock: 22, unitCost: 1000, sellingPrice: 1450, stockAlertLevel: 5, remarks: '15L, Waterproof', dateAdded: '2024-03-20' },
  { id: '5', sku: 'FD-007', name: 'USB Flash Drive', stock: 28, unitCost: 250, sellingPrice: 420, stockAlertLevel: 10, remarks: '64GB Extreme', dateAdded: '2024-04-05' },
  { id: '4', sku: 'NB-008', name: 'Notebook Set', stock: 90, unitCost: 80, sellingPrice: 150, stockAlertLevel: 15, remarks: 'A5, 100 pages', dateAdded: '2024-04-15' },
  { id: '3', sku: 'WM-009', name: 'Wireless Mouse', stock: 42, unitCost: 300, sellingPrice: 480, stockAlertLevel: 10, remarks: 'Optical, 2.4Ghz', dateAdded: '2024-05-01' },
  { id: '12', sku: 'DL-010', name: 'LED Desk Lamp', stock: 12, unitCost: 1200, sellingPrice: 1850, stockAlertLevel: 3, remarks: 'Dimmable, USB port', dateAdded: '2024-05-15' },
  { id: '13', sku: 'BS-011', name: 'Bluetooth Speaker', stock: 8, unitCost: 2500, sellingPrice: 3950, stockAlertLevel: 5, remarks: 'Portable, IPX7', dateAdded: '2024-06-01' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Opening Stocks
  ...INITIAL_ITEMS.map(item => ({
    id: `opening-${item.id}`,
    date: item.dateAdded,
    type: 'opening' as const,
    itemId: item.id,
    quantity: item.stock,
    unitPrice: item.unitCost,
    remarks: 'Initial stock load'
  })),

  // Monthly Sales/Purchases for 1 year history
  // 2024 Q1
  { id: 't1', date: '2024-01-20', type: 'sale', itemId: '11', quantity: 2, unitPrice: 850, remarks: 'Local sale' },
  { id: 't2', date: '2024-01-25', type: 'purchase', itemId: '10', quantity: 20, unitPrice: 150, remarks: 'Restock' },
  { id: 't3', date: '2024-02-15', type: 'sale', itemId: '10', quantity: 15, unitPrice: 280 },
  { id: 't4', date: '2024-02-28', type: 'sale', itemId: '9', quantity: 5, unitPrice: 580 },
  { id: 't5', date: '2024-03-10', type: 'purchase', itemId: '8', quantity: 30, unitPrice: 200 },
  { id: 't6', date: '2024-03-25', type: 'sale', itemId: '8', quantity: 12, unitPrice: 350 },

  // 2024 Q2
  { id: 't7', date: '2024-04-10', type: 'sale', itemId: '7', quantity: 50, unitPrice: 95 },
  { id: 't8', date: '2024-04-22', type: 'sale', itemId: '6', quantity: 3, unitPrice: 1450 },
  { id: 't9', date: '2024-05-05', type: 'purchase', itemId: '12', quantity: 10, unitPrice: 1200 },
  { id: 't10', date: '2024-05-18', type: 'sale', itemId: '12', quantity: 2, unitPrice: 1850 },
  { id: 't11', date: '2024-06-12', type: 'sale', itemId: '13', quantity: 1, unitPrice: 3950 },
  { id: 't12', date: '2024-06-25', type: 'sale', itemId: '5', quantity: 10, unitPrice: 420 },

  // 2024 Q3
  { id: 't13', date: '2024-07-08', type: 'purchase', itemId: '4', quantity: 50, unitPrice: 80 },
  { id: 't14', date: '2024-07-20', type: 'sale', itemId: '4', quantity: 30, unitPrice: 150 },
  { id: 't15', date: '2024-08-15', type: 'sale', itemId: '3', quantity: 10, unitPrice: 480 },
  { id: 't16', date: '2024-08-29', type: 'sale', itemId: '11', quantity: 3, unitPrice: 850 },
  { id: 't17', date: '2024-09-10', type: 'purchase', itemId: '10', quantity: 25, unitPrice: 150 },
  { id: 't18', date: '2024-09-25', type: 'sale', itemId: '10', quantity: 20, unitPrice: 280 },

  // 2024 Q4
  { id: 't19', date: '2024-10-05', type: 'sale', itemId: '9', quantity: 8, unitPrice: 580 },
  { id: 't20', date: '2024-10-22', type: 'purchase', itemId: '6', quantity: 5, unitPrice: 1000 },
  { id: 't21', date: '2024-11-12', type: 'sale', itemId: '6', quantity: 2, unitPrice: 1450 },
  { id: 't22', date: '2024-11-28', type: 'sale', itemId: '8', quantity: 15, unitPrice: 350 },
  { id: 't23', date: '2024-12-15', type: 'sale', itemId: '7', quantity: 80, unitPrice: 95, remarks: 'Holiday season sale' },
  { id: 't24', date: '2024-12-28', type: 'sale', itemId: '13', quantity: 2, unitPrice: 3950 },

  // 2025 Q1 (Current Year)
  { id: 't25', date: '2025-01-10', type: 'purchase', itemId: '5', quantity: 40, unitPrice: 250 },
  { id: 't26', date: '2025-01-25', type: 'sale', itemId: '5', quantity: 15, unitPrice: 420 },
  { id: 't27', date: '2025-02-14', type: 'sale', itemId: '4', quantity: 25, unitPrice: 150 },
  { id: 't28', date: '2025-02-28', type: 'sale', itemId: '3', quantity: 12, unitPrice: 480 },
  { id: 't29', date: '2025-03-15', type: 'purchase', itemId: '12', quantity: 15, unitPrice: 1200 },
  { id: 't30', date: '2025-03-22', type: 'sale', itemId: '12', quantity: 8, unitPrice: 1850 },

  // 2025 Q2 (Trending up)
  { id: 't31', date: '2025-04-05', type: 'sale', itemId: '13', quantity: 4, unitPrice: 3950 },
  { id: 't32', date: '2025-04-18', type: 'purchase', itemId: '11', quantity: 10, unitPrice: 600 },
  { id: 't33', date: '2025-05-10', type: 'sale', itemId: '11', quantity: 8, unitPrice: 850 },
  { id: 't34', date: '2025-05-25', type: 'sale', itemId: '10', quantity: 30, unitPrice: 280 },
  { id: 't35', date: '2025-06-02', type: 'purchase', itemId: '9', quantity: 20, unitPrice: 400 },
  { id: 't36', date: '2025-06-15', type: 'sale', itemId: '9', quantity: 15, unitPrice: 580 },
  { id: 't37', date: '2025-06-28', type: 'sale', itemId: '8', quantity: 25, unitPrice: 350 },
  { id: 't38', date: '2025-06-29', type: 'sale', itemId: '13', quantity: 2, unitPrice: 3950, remarks: 'Large order' },
];
