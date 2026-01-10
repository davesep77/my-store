
export type Tab = 'dashboard' | 'management' | 'items' | 'new-stocks' | 'sales' | 'purchase' | 'report' | 'settings' | 'departments' | 'customers' | 'vendors' | 'invoice-properties' | 'employees' | 'time-clock' | 'kits' | 'back-orders' | 'styles' | 'pricing' | 'customer-prices' | 'settlements' | 'global-pricing';

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
  invoiceHeader?: string;
  invoiceFooter?: string;
  nextInvoiceNumber?: number;
  invoiceTerms?: string;
  taxRate?: number;
}


export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Customer {
  id: string;
  customerNumber?: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  dateAdded: string;
}

export interface Vendor {
  id: string;
  vendorNumber?: string;
  companyName: string;
  poDeliveryMethod?: 'Print' | 'Email' | 'Fax';
  terms?: string;
  flatRentRate?: number;
  taxId?: string;
  minOrder?: number;
  commissionPercent?: number;
  billableDepartment?: string;
  socialSecurityNumber?: string;

  // Address
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;

  // Legacy
  address?: string;

  // Contact
  contactFirstName?: string;
  contactLastName?: string;
  contactPerson?: string; // Legacy support
  email: string;
  phone: string;
  fax?: string;
  website?: string;
}

export interface AppState {
  items: Item[];
  transactions: Transaction[];
  settings: UserSettings;
  departments: Department[];
  customers: Customer[];
  vendors: Vendor[];
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  role: 'Manager' | 'Cashier' | 'Staff';
  pinCode?: string;
  hourlyRate?: number;
  startDate?: string;
  isActive: boolean;
}

export interface TimeEntry {
  id: number;
  employeeId: string;
  action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: string;
}

export interface KitComponent {
  id: number;
  kitId: string;
  itemId: string;
  quantity: number;
}

export interface Kit {
  id: string;
  name: string;
  description?: string;
  price?: number;
  components?: KitComponent[];
}

export interface BackOrder {
  id: string;
  customerId: string;
  itemId: string;
  quantity: number;
  orderDate: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  // Joined fields
  itemName?: string;
  sku?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface StyleVariant {
  id: number;
  styleId: string;
  variantName: string;
  variantValue: string;
  skuModifier: string;
}

export interface Style {
  id: string;
  name: string;
  baseItemId?: string;
  baseItemName?: string;
  variants?: StyleVariant[];
}

export interface MixMatchItem {
  id: number;
  groupId: string;
  itemId: string;
  itemName?: string;
  sku?: string;
  price?: number;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'quantity' | 'bogo';
  quantityNeeded: number;
  discountAmount: number;
  discountType: 'fixed_price' | 'percentage_off';
  startDate?: string;
  endDate?: string;
  items?: MixMatchItem[];
}

export interface CustomerPrice {
  id: number;
  customerId: string;
  itemId: string;
  price: number;
  // Joined
  firstName?: string;
  lastName?: string;
  company?: string;
  itemName?: string;
  sku?: string;
  regularPrice?: number;
}

export interface Settlement {
  id: number;
  settlementDate: string;
  totalAmount: number;
  status: 'Pending' | 'Settled';
  notes: string;
}