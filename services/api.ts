export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

import { Item, Transaction, UserSettings, Department, Customer, Vendor, Employee, TimeEntry, Kit, BackOrder, Style, PricingRule, CustomerPrice, Settlement } from '../types';

export const api = {
    async getItems(): Promise<Item[]> {
        const res = await fetch(`${API_BASE_URL}/items.php`);
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    },

    async createItem(item: Item): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/items.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to create item');
    },

    async updateItem(item: Item): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/items.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to update item');
    },

    async deleteItem(id: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/items.php?id=${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete item');
    },

    async getTransactions(): Promise<Transaction[]> {
        const res = await fetch(`${API_BASE_URL}/transactions.php`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },

    async createTransaction(transaction: Transaction): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/transactions.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction),
        });
        if (!res.ok) throw new Error('Failed to create transaction');
    },

    async getSettings(): Promise<UserSettings> {
        const res = await fetch(`${API_BASE_URL}/settings.php`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    async updateSettings(settings: UserSettings): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/settings.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!res.ok) throw new Error('Failed to update settings');
    },

    async deleteTransaction(id: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/transactions.php?id=${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete transaction');
    },

    // Departments
    async getDepartments(): Promise<Department[]> {
        const res = await fetch(`${API_BASE_URL}/departments.php`);
        if (!res.ok) throw new Error('Failed to fetch departments');
        return res.json();
    },
    async createDepartment(data: Department): Promise<void> {
        await fetch(`${API_BASE_URL}/departments.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateDepartment(data: Department): Promise<void> {
        await fetch(`${API_BASE_URL}/departments.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteDepartment(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/departments.php?id=${id}`, { method: 'DELETE' });
    },

    // Customers
    async getCustomers(): Promise<Customer[]> {
        const res = await fetch(`${API_BASE_URL}/customers.php`);
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
    },
    async createCustomer(data: Customer): Promise<void> {
        await fetch(`${API_BASE_URL}/customers.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateCustomer(data: Customer): Promise<void> {
        await fetch(`${API_BASE_URL}/customers.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteCustomer(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/customers.php?id=${id}`, { method: 'DELETE' });
    },

    // Vendors
    async getVendors(): Promise<Vendor[]> {
        const res = await fetch(`${API_BASE_URL}/vendors.php`);
        if (!res.ok) throw new Error('Failed to fetch vendors');
        return res.json();
    },
    async createVendor(data: Vendor): Promise<void> {
        await fetch(`${API_BASE_URL}/vendors.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateVendor(data: Vendor): Promise<void> {
        await fetch(`${API_BASE_URL}/vendors.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteVendor(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/vendors.php?id=${id}`, { method: 'DELETE' });
    },

    // Employees
    async getEmployees(): Promise<Employee[]> {
        const res = await fetch(`${API_BASE_URL}/employees.php`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        return res.json();
    },
    async createEmployee(data: Employee): Promise<void> {
        await fetch(`${API_BASE_URL}/employees.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateEmployee(data: Employee): Promise<void> {
        await fetch(`${API_BASE_URL}/employees.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteEmployee(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/employees.php?id=${id}`, { method: 'DELETE' });
    },

    // Time Clock
    async getTimeEntries(employeeId?: string): Promise<TimeEntry[]> {
        const query = employeeId ? `?employeeId=${employeeId}` : '';
        const res = await fetch(`${API_BASE_URL}/time_clock.php${query}`);
        if (!res.ok) throw new Error('Failed to fetch time entries');
        return res.json();
    },
    async addTimeEntry(employeeId: string, action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end', timestamp?: string): Promise<void> {
        await fetch(`${API_BASE_URL}/time_clock.php`, {
            method: 'POST',
            body: JSON.stringify({ employeeId, action, timestamp })
        });
    },
    async updateTimeEntry(data: TimeEntry): Promise<void> {
        await fetch(`${API_BASE_URL}/time_clock.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteTimeEntry(id: number): Promise<void> {
        await fetch(`${API_BASE_URL}/time_clock.php?id=${id}`, { method: 'DELETE' });
    },

    // Kits
    async getKits(): Promise<Kit[]> {
        const res = await fetch(`${API_BASE_URL}/kits.php`);
        if (!res.ok) throw new Error('Failed to fetch kits');
        return res.json();
    },
    async createKit(data: Kit): Promise<void> {
        await fetch(`${API_BASE_URL}/kits.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateKit(data: Kit): Promise<void> {
        await fetch(`${API_BASE_URL}/kits.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteKit(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/kits.php?id=${id}`, { method: 'DELETE' });
    },

    // Back Orders
    async getBackOrders(): Promise<BackOrder[]> {
        const res = await fetch(`${API_BASE_URL}/backorders.php`);
        if (!res.ok) throw new Error('Failed to fetch back orders');
        return res.json();
    },
    async createBackOrder(data: BackOrder): Promise<void> {
        await fetch(`${API_BASE_URL}/backorders.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateBackOrder(data: BackOrder): Promise<void> {
        await fetch(`${API_BASE_URL}/backorders.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteBackOrder(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/backorders.php?id=${id}`, { method: 'DELETE' });
    },

    // Styles
    async getStyles(): Promise<Style[]> {
        const res = await fetch(`${API_BASE_URL}/styles.php`);
        if (!res.ok) throw new Error('Failed to fetch styles');
        return res.json();
    },
    async createStyle(data: Style): Promise<void> {
        await fetch(`${API_BASE_URL}/styles.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateStyle(data: Style): Promise<void> {
        await fetch(`${API_BASE_URL}/styles.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteStyle(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/styles.php?id=${id}`, { method: 'DELETE' });
    },

    // Pricing Rules
    async getPricingRules(): Promise<PricingRule[]> {
        const res = await fetch(`${API_BASE_URL}/pricing.php`);
        if (!res.ok) throw new Error('Failed to fetch pricing rules');
        return res.json();
    },
    async createPricingRule(data: PricingRule): Promise<void> {
        await fetch(`${API_BASE_URL}/pricing.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updatePricingRule(data: PricingRule): Promise<void> {
        await fetch(`${API_BASE_URL}/pricing.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deletePricingRule(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/pricing.php?id=${id}`, { method: 'DELETE' });
    },

    // Customer Prices
    async getCustomerPrices(): Promise<CustomerPrice[]> {
        const res = await fetch(`${API_BASE_URL}/customer_prices.php`);
        if (!res.ok) throw new Error('Failed to fetch customer prices');
        return res.json();
    },
    async createCustomerPrice(data: CustomerPrice): Promise<void> {
        await fetch(`${API_BASE_URL}/customer_prices.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateCustomerPrice(data: CustomerPrice): Promise<void> {
        await fetch(`${API_BASE_URL}/customer_prices.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteCustomerPrice(id: number): Promise<void> {
        await fetch(`${API_BASE_URL}/customer_prices.php?id=${id}`, { method: 'DELETE' });
    },

    // Settlements
    async getSettlements(): Promise<Settlement[]> {
        const res = await fetch(`${API_BASE_URL}/settlements.php`);
        if (!res.ok) throw new Error('Failed to fetch settlements');
        return res.json();
    },
    async createSettlement(data: Settlement): Promise<void> {
        await fetch(`${API_BASE_URL}/settlements.php`, { method: 'POST', body: JSON.stringify(data) });
    },
    async updateSettlement(data: Settlement): Promise<void> {
        await fetch(`${API_BASE_URL}/settlements.php`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async deleteSettlement(id: number): Promise<void> {
        await fetch(`${API_BASE_URL}/settlements.php?id=${id}`, { method: 'DELETE' });
    },

    // Global Pricing
    async bulkUpdatePrices(updates: { id: string; price: number }[]): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/bulk_update_prices.php`, {
            method: 'POST',
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to bulk update prices');
    }
};
