import { supabaseApi } from './supabase-api';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

import { Item, Transaction, UserSettings, Department, Customer, Vendor, Employee, TimeEntry, Kit, BackOrder, Style, PricingRule, CustomerPrice, Settlement } from '../types';

export const api = supabaseApi;

export const apiOld = {
    async getItems(): Promise<Item[]> {
        const res = await fetch(`${API_BASE_URL}/items`);
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    },

    async createItem(item: Item): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to create item');
    },

    async updateItem(item: Item): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/items/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to update item');
    },

    async deleteItem(id: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/items/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete item');
    },

    async getTransactions(): Promise<Transaction[]> {
        const res = await fetch(`${API_BASE_URL}/transactions`);
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },

    async createTransaction(transaction: Transaction): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction),
        });
        if (!res.ok) throw new Error('Failed to create transaction');
    },

    async getSettings(): Promise<UserSettings> {
        const res = await fetch(`${API_BASE_URL}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    async updateSettings(settings: UserSettings): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Failed to update settings: ${err}`);
        }
    },

    async deleteTransaction(id: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete transaction');
    },

    // Departments
    async getDepartments(): Promise<Department[]> {
        const res = await fetch(`${API_BASE_URL}/departments`);
        if (!res.ok) throw new Error('Failed to fetch departments');
        return res.json();
    },
    async createDepartment(data: Department): Promise<void> {
        await fetch(`${API_BASE_URL}/departments`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateDepartment(data: Department): Promise<void> {
        await fetch(`${API_BASE_URL}/departments/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteDepartment(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/departments/${id}`, { method: 'DELETE' });
    },

    // Customers
    async getCustomers(): Promise<Customer[]> {
        const res = await fetch(`${API_BASE_URL}/customers`);
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
    },
    async createCustomer(data: Customer): Promise<void> {
        await fetch(`${API_BASE_URL}/customers`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateCustomer(data: Customer): Promise<void> {
        await fetch(`${API_BASE_URL}/customers/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteCustomer(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/customers/${id}`, { method: 'DELETE' });
    },

    // Vendors
    async getVendors(): Promise<Vendor[]> {
        const res = await fetch(`${API_BASE_URL}/vendors`);
        if (!res.ok) throw new Error('Failed to fetch vendors');
        return res.json();
    },
    async createVendor(data: Vendor): Promise<void> {
        await fetch(`${API_BASE_URL}/vendors`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateVendor(data: Vendor): Promise<void> {
        await fetch(`${API_BASE_URL}/vendors/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteVendor(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/vendors/${id}`, { method: 'DELETE' });
    },

    // Employees
    async getEmployees(): Promise<Employee[]> {
        const res = await fetch(`${API_BASE_URL}/employees`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        return res.json();
    },
    async createEmployee(data: Employee): Promise<void> {
        await fetch(`${API_BASE_URL}/employees`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateEmployee(data: Employee): Promise<void> {
        await fetch(`${API_BASE_URL}/employees/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteEmployee(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
    },

    // Time Clock
    async getTimeEntries(employeeId?: string): Promise<TimeEntry[]> {
        const query = employeeId ? `?employeeId=${employeeId}` : '';
        const res = await fetch(`${API_BASE_URL}/time_clock${query}`);
        if (!res.ok) throw new Error('Failed to fetch time entries');
        return res.json();
    },
    async addTimeEntry(employeeId: string, action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end', timestamp?: string): Promise<void> {
        await fetch(`${API_BASE_URL}/time_clock`, {
            method: 'POST',
            body: JSON.stringify({ employeeId, action, timestamp }),
            headers: { 'Content-Type': 'application/json' }
        });
    },
    async updateTimeEntry(data: TimeEntry): Promise<void> {
        // Assuming TimeEntry has an id
        await fetch(`${API_BASE_URL}/time_clock/${(data as any).id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteTimeEntry(id: number): Promise<void> {
        await fetch(`${API_BASE_URL}/time_clock/${id}`, { method: 'DELETE' });
    },

    // Kits
    async getKits(): Promise<Kit[]> {
        const res = await fetch(`${API_BASE_URL}/kits`);
        if (!res.ok) throw new Error('Failed to fetch kits');
        return res.json();
    },
    async createKit(data: Kit): Promise<void> {
        await fetch(`${API_BASE_URL}/kits`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateKit(data: Kit): Promise<void> {
        await fetch(`${API_BASE_URL}/kits/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteKit(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/kits/${id}`, { method: 'DELETE' });
    },

    // Back Orders
    async getBackOrders(): Promise<BackOrder[]> {
        const res = await fetch(`${API_BASE_URL}/backorders`);
        if (!res.ok) throw new Error('Failed to fetch back orders');
        return res.json();
    },
    async createBackOrder(data: BackOrder): Promise<void> {
        await fetch(`${API_BASE_URL}/backorders`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateBackOrder(data: BackOrder): Promise<void> {
        await fetch(`${API_BASE_URL}/backorders/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteBackOrder(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/backorders/${id}`, { method: 'DELETE' });
    },

    // Styles
    async getStyles(): Promise<Style[]> {
        const res = await fetch(`${API_BASE_URL}/styles`);
        if (!res.ok) throw new Error('Failed to fetch styles');
        return res.json();
    },
    async createStyle(data: Style): Promise<void> {
        await fetch(`${API_BASE_URL}/styles`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateStyle(data: Style): Promise<void> {
        await fetch(`${API_BASE_URL}/styles/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteStyle(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/styles/${id}`, { method: 'DELETE' });
    },

    // Pricing Rules
    async getPricingRules(): Promise<PricingRule[]> {
        const res = await fetch(`${API_BASE_URL}/pricing`);
        if (!res.ok) throw new Error('Failed to fetch pricing rules');
        return res.json();
    },
    async createPricingRule(data: PricingRule): Promise<void> {
        await fetch(`${API_BASE_URL}/pricing`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updatePricingRule(data: PricingRule): Promise<void> {
        await fetch(`${API_BASE_URL}/pricing/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deletePricingRule(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/pricing/${id}`, { method: 'DELETE' });
    },

    // Customer Prices
    async getCustomerPrices(): Promise<CustomerPrice[]> {
        const res = await fetch(`${API_BASE_URL}/customer_prices`);
        if (!res.ok) throw new Error('Failed to fetch customer prices');
        return res.json();
    },
    async createCustomerPrice(data: CustomerPrice): Promise<void> {
        await fetch(`${API_BASE_URL}/customer_prices`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateCustomerPrice(data: CustomerPrice): Promise<void> {
        await fetch(`${API_BASE_URL}/customer_prices/${(data as any).id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteCustomerPrice(id: number): Promise<void> {
        await fetch(`${API_BASE_URL}/customer_prices/${id}`, { method: 'DELETE' });
    },

    // Settlements
    async getSettlements(): Promise<Settlement[]> {
        const res = await fetch(`${API_BASE_URL}/settlements`);
        if (!res.ok) throw new Error('Failed to fetch settlements');
        return res.json();
    },
    async createSettlement(data: Settlement): Promise<void> {
        await fetch(`${API_BASE_URL}/settlements`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async updateSettlement(data: Settlement): Promise<void> {
        // Settlement type in types.ts might not have ID? Assuming it does if we are updating.
        await fetch(`${API_BASE_URL}/settlements/${(data as any).id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    },
    async deleteSettlement(id: number): Promise<void> {
        await fetch(`${API_BASE_URL}/settlements/${id}`, { method: 'DELETE' });
    },

    // Global Pricing
    async bulkUpdatePrices(updates: { id: string; price: number }[]): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/bulk_update_prices`, {
            method: 'POST',
            body: JSON.stringify(updates),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to bulk update prices');
    },

    // Payment Methods
    async getPaymentMethods(): Promise<any[]> {
        const res = await fetch(`${API_BASE_URL}/payment_methods`);
        if (!res.ok) throw new Error('Failed to fetch payment methods');
        return res.json();
    },

    async addPaymentMethod(data: any): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/payment_methods`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to add payment method');
    },

    async deletePaymentMethod(id: string): Promise<void> {
        await fetch(`${API_BASE_URL}/payment_methods/${id}`, { method: 'DELETE' });
    },

    // SaaS Methods
    async submitPayment(data: { userId: string; paymentMethod: string; transactionId: string }): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/submit-payment`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to submit payment');
        return res.json();
    },

    async adminUpdateStatus(data: { userId: string; status: string }): Promise<any> {
        const res = await fetch(`${API_BASE_URL}/admin/update-status`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to update user status');
        return res.json();
    }
};
