
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { Purchase } from './components/Purchase';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { NewStocks } from './components/NewStocks';
import { Auth } from './components/Auth';
import { Tab, Item, Transaction, UserSettings, User } from './types';
import { INITIAL_ITEMS, INITIAL_TRANSACTIONS, INITIAL_SETTINGS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('inventory_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('inventory_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('inventory_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('inventory_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('inventory_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('inventory_session');
    }
    localStorage.setItem('inventory_items', JSON.stringify(items));
    localStorage.setItem('inventory_transactions', JSON.stringify(transactions));
    localStorage.setItem('inventory_settings', JSON.stringify(settings));
  }, [user, items, transactions, settings]);

  const addItem = (newItem: Omit<Item, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setItems(prev => [...prev, { ...newItem, id }]);
  };

  const updateItem = (updatedItem: Item) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setTransactions(prev => prev.filter(t => t.itemId !== id));
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newT = { ...t, id };
    setTransactions(prev => [...prev, newT]);

    // Update stock levels
    setItems(prev => prev.map(item => {
      if (item.id === t.itemId) {
        const stockChange = t.type === 'sale' ? -t.quantity : t.quantity;
        return { ...item, stock: item.stock + stockChange };
      }
      return item;
    }));
  };

  const deleteTransaction = (id: string) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    // Revert stock levels
    setItems(prev => prev.map(item => {
      if (item.id === transactionToDelete.itemId) {
        const revertValue = transactionToDelete.type === 'sale' ? transactionToDelete.quantity : -transactionToDelete.quantity;
        return { ...item, stock: item.stock + revertValue };
      }
      return item;
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard items={items} transactions={transactions} settings={settings} />;
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
        return <Settings settings={settings} onUpdate={setSettings} />;
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
