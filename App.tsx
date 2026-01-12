
import React, { useState, useEffect } from 'react';
import { Subscription } from './components/Subscription';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { Purchase } from './components/Purchase';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { NewStocks } from './components/NewStocks';
import { ManagementGrid } from './components/ManagementGrid';
import { DepartmentMaintenance } from './components/DepartmentMaintenance';
import { CustomerMaintenance } from './components/CustomerMaintenance';
import { VendorMaintenance } from './components/VendorMaintenance';
import { EmployeeMaintenance } from './components/EmployeeMaintenance';
import { TimeClockManagement } from './components/TimeClockManagement';
import { KitMaintenance } from './components/KitMaintenance';
import { BackOrderManagement } from './components/BackOrderManagement';
import { StylesMatrix } from './components/StylesMatrix';
import { MixMatchPricing } from './components/MixMatchPricing';
import { CustomerPriceManager } from './components/CustomerPriceManager';
import { SettlementManager } from './components/SettlementManager';
import GlobalPricingManager from './components/GlobalPricingManager';
import { InvoiceProperties } from './components/InvoiceProperties';
import { Auth } from './components/Auth';
import { SaaSGate } from './components/SaaSGate';
import { AdminApprovals } from './components/AdminApprovals';
import { Tab, Item, Transaction, UserSettings, User } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('inventory_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    currency: 'GBP',
    locale: 'en-GB',
    dateFormat: 'DD/MM/YYYY',
    email: 'admin@mystore.com'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedItems, fetchedTransactions, fetchedSettings] = await Promise.all([
        api.getItems(),
        api.getTransactions(),
        api.getSettings()
      ]);
      setItems(fetchedItems || []);
      setTransactions(fetchedTransactions || []);
      setSettings(fetchedSettings);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('inventory_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('inventory_session');
    }
  }, [user]);

  const addItem = async (newItem: Omit<Item, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await api.createItem({ ...newItem, id });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to add item');
    }
  };

  const updateItem = async (updatedItem: Item) => {
    try {
      await api.updateItem(updatedItem);
      setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    } catch (err) {
      console.error(err);
      alert('Failed to update item');
      fetchData(); // Revert on failure
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      setTransactions(prev => prev.filter(t => t.itemId !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete item');
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await api.createTransaction({ ...t, id });

      const item = items.find(i => i.id === t.itemId);
      if (item) {
        const stockChange = t.type === 'sale' ? -t.quantity : t.quantity;
        const updatedItem = { ...item, stock: item.stock + stockChange };
        await api.updateItem(updatedItem);
      }

      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to process transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const transactionToDelete = transactions.find(t => t.id === id);
      if (!transactionToDelete) return;

      await api.deleteTransaction(id);

      // Revert stock levels logic
      const item = items.find(i => i.id === transactionToDelete.itemId);
      if (item) {
        const revertValue = transactionToDelete.type === 'sale' ? transactionToDelete.quantity : -transactionToDelete.quantity;
        const updatedItem = { ...item, stock: item.stock + revertValue };
        await api.updateItem(updatedItem);
      }

      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete transaction');
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    try {
      await api.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update settings');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // SaaS Gate: Block non-admin users if account is not active
  if (user.role !== 'admin' && user.account_status !== 'active') {
    return (
      <SaaSGate
        user={user}
        onLogout={handleLogout}
        onStatusUpdate={(updatedUser) => {
          localStorage.setItem('inventory_session', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }}
      />
    );
  }

  // Show loading state to prevent flashes
  if (loading && !items.length && !transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/10">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-100 border-t-[#8E54E9]"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-200 opacity-20"></div>
        </div>
        <p className="mt-6 text-sm font-bold text-gray-500 animate-pulse">Loading your store...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p className="text-xl font-bold mb-2">Error connecting to backend</p>
        <p>{error}</p>
        <p className="mt-4 text-gray-600 text-sm">Make sure Apache and MySQL are running in XAMPP.</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard items={items} transactions={transactions} settings={settings} />;
      case 'management':
        return <ManagementGrid onNavigate={setActiveTab} />;
      case 'departments':
        return <DepartmentMaintenance />;
      case 'customers':
        return <CustomerMaintenance />;
      case 'vendors':
        return <VendorMaintenance />;
      case 'employees':
        return <EmployeeMaintenance />;
      case 'time-clock':
        return <TimeClockManagement />;
      case 'kits':
        return <KitMaintenance />;
      case 'back-orders':
        return <BackOrderManagement />;
      case 'styles':
        return <StylesMatrix />;
      case 'pricing':
        return <MixMatchPricing />;
      case 'customer-prices':
        return <CustomerPriceManager />;
      case 'settlements':
        return <SettlementManager />;
      case 'global-pricing':
        return <GlobalPricingManager />;
      case 'items':
        return <Inventory items={items} transactions={transactions} onUpdate={updateItem} onDelete={deleteItem} settings={settings} />;
      case 'new-stocks':
        return <NewStocks items={items} onAdd={addItem} onUpdate={updateItem} onDelete={deleteItem} settings={settings} />;
      case 'sales':
        return <Sales items={items} transactions={transactions} onAddTransaction={addTransaction} onDeleteTransaction={deleteTransaction} settings={settings} />;
      case 'purchase':
        return <Purchase items={items} transactions={transactions} onAddTransaction={addTransaction} onDeleteTransaction={deleteTransaction} settings={settings} />;
      case 'report':
        return <Reports items={items} transactions={transactions} onDeleteTransaction={deleteTransaction} settings={settings} />;
      case 'settings':
        return <Settings settings={settings} onUpdate={updateSettings} />;
      case 'invoice-properties':
        return <InvoiceProperties onNavigate={setActiveTab} />;
      case 'admin-approvals':
        return <AdminApprovals />;
      default:
        return <Dashboard items={items} transactions={transactions} settings={settings} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
