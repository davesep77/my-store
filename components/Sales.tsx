
import React, { useState, useEffect, useRef } from 'react';
import { Item, Transaction, UserSettings, Department, Customer } from '../types';
import { Search, X, Trash2, Tag, Percent, Minus, Plus, Banknote, CreditCard, FileText, Scale, Barcode, Users } from 'lucide-react';
import { api } from '../services/api';
import { CustomerSelectionModal } from './CustomerSelectionModal';
import { InvoiceModal } from './InvoiceModal';

interface SalesProps {
  items: Item[];
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  settings: UserSettings;
}


interface CartItem {
  id: string; // pseudo-id for cart
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export const Sales: React.FC<SalesProps> = ({ items, onAddTransaction, settings }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<'items' | 'payment'>('items');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    // Fetch departments for Quick Keys
    api.getDepartments().then(setDepartments).catch(console.error);

    // Auto-focus barcode input
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  }, []);

  // Update selection when cart changes
  useEffect(() => {
    if (cart.length > 0 && selectedItemIndex === null) {
      setSelectedItemIndex(cart.length - 1);
    } else if (cart.length === 0) {
      setSelectedItemIndex(null);
    }
  }, [cart]);

  const addToCart = (item: Item, qty: number = 1) => {
    const existingIdx = cart.findIndex(c => c.itemId === item.id);
    if (existingIdx >= 0) {
      const newCart = [...cart];
      newCart[existingIdx].quantity += qty;
      setCart(newCart);
      setSelectedItemIndex(existingIdx);
    } else {
      setCart([...cart, {
        id: Math.random().toString(36).substr(2, 9),
        itemId: item.id,
        name: item.name,
        quantity: qty,
        price: item.sellingPrice
      }]);
      setSelectedItemIndex(cart.length);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    // Simulate partial match/barcode search
    const found = items.find(i =>
      i.sku === searchQuery ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      addToCart(found);
      setSearchQuery('');
    } else {
      alert('Item not found');
    }
  };

  // --- Toolbar Actions ---

  const handleDeleteItem = () => {
    if (selectedItemIndex !== null && selectedItemIndex >= 0 && selectedItemIndex < cart.length) {
      const newCart = [...cart];
      newCart.splice(selectedItemIndex, 1);
      setCart(newCart);
      setSelectedItemIndex(newCart.length > 0 ? newCart.length - 1 : null);
    }
  };

  const handleDiscountItem = () => {
    if (selectedItemIndex === null) return;
    const item = cart[selectedItemIndex];
    const discountStr = prompt(`Enter Discount % for ${item.name}:`, "0");
    if (discountStr !== null) {
      const discount = parseFloat(discountStr);
      if (!isNaN(discount)) {
        // Retrieve original price from items list to ensure we don't compound discounts incorrectly on the base price 
        // IF we were tracking base price. Here we just assume current price is the base to discount from or we just override.
        // For simplicity, let's treat it as applying a discount to the CURRENT price in the cart.
        // A better way is to store 'originalPrice' in cart item.
        // For now: update price.
        const originalItem = items.find(i => i.id === item.itemId);
        const basePrice = originalItem ? originalItem.sellingPrice : item.price;
        const newPrice = basePrice * (1 - discount / 100);

        const newCart = [...cart];
        newCart[selectedItemIndex] = { ...item, price: newPrice };
        setCart(newCart);
      }
    }
  };

  const handleQuantityChange = () => {
    if (selectedItemIndex === null) return;
    const item = cart[selectedItemIndex];
    const qtyStr = prompt(`Enter Quantity for ${item.name}:`, item.quantity.toString());
    if (qtyStr !== null) {
      const qty = parseInt(qtyStr);
      if (!isNaN(qty) && qty > 0) {
        const newCart = [...cart];
        newCart[selectedItemIndex] = { ...item, quantity: qty };
        setCart(newCart);
      }
    }
  };

  const handlePriceChange = () => {
    if (selectedItemIndex === null) return;
    const item = cart[selectedItemIndex];
    const priceStr = prompt(`Enter New Price for ${item.name}:`, item.price.toFixed(2));
    if (priceStr !== null) {
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price >= 0) {
        const newCart = [...cart];
        newCart[selectedItemIndex] = { ...item, price: price };
        setCart(newCart);
      }
    }
  };

  const handleDecrementQuantity = () => {
    if (selectedItemIndex === null) return;
    const item = cart[selectedItemIndex];
    if (item.quantity > 1) {
      const newCart = [...cart];
      newCart[selectedItemIndex] = { ...item, quantity: item.quantity - 1 };
      setCart(newCart);
    } else {
      // If 1, maybe confirm delete?
      if (confirm(`Remove ${item.name}?`)) {
        handleDeleteItem();
      }
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency
    }).format(amount);
  };

  const handlePayment = async (method: string) => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const nextInvoiceId = settings.nextInvoiceNumber || 1000;
    const batchId = `INV-${nextInvoiceId}`;
    const today = new Date().toISOString().split('T')[0];

    // Create transactions for each item
    for (const item of cart) {
      onAddTransaction({
        batchId: batchId,
        date: today,
        type: 'sale', // Can distinguish return/sale if needed
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.price,
        remarks: `Payment: ${method}`
      });
    }

    // Update settings (increment invoice #)
    try {
      await api.updateSettings({ ...settings, nextInvoiceNumber: nextInvoiceId + 1 });
    } catch (e) {
      console.error("Failed to increment invoice number", e);
    }

    // Prepare Invoice Data
    const invoiceData = {
      invoiceNumber: batchId,
      date: today,
      customer: selectedCustomer,
      items: cart.map(c => ({ item: items.find(i => i.id === c.itemId)!, quantity: c.quantity, price: c.price })),
      subtotal: subTotal,
      tax: tax,
      total: grandTotal,
      paymentMethod: method,
      settings: settings
    };

    setCompletedInvoice(invoiceData);
    setShowInvoice(true);
    // Note: We don't clear cart here immediately, we clear it after invoice is closed/done
  };

  const handleInvoiceClose = () => {
    setShowInvoice(false);
    setCompletedInvoice(null);
    setCart([]);
    setSelectedCustomer(null);
    setRightPanelMode('items');
    setSelectedItemIndex(null);
  };

  const subTotal = cart.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subTotal * 0.08875; // Example NY Tax
  const grandTotal = subTotal + tax;

  const quickItems = selectedDeptId
    ? items.filter(i => i.departmentId === selectedDeptId)
    : items.slice(0, 16);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100 overflow-hidden font-sans select-none">
      {/* LEFT PANEL: Transaction List (Same for both modes) */}
      <div className="w-[45%] flex flex-col border-r border-gray-300 bg-[#e6e6e6]">

        {/* Top Input Area */}
        <div className="p-2 bg-gradient-to-b from-[#8facca] to-[#7196bc] border-b border-[#5e7d9e] flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-white text-xs font-bold mb-0.5 shadow-sm text-shadow">Scan Barcode Now...</label>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-1">
              <input
                ref={barcodeInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8 border border-gray-400 pl-2 text-sm shadow-inner outline-none focus:border-blue-500"
                autoFocus
              />
            </form>
          </div>
          <div className="w-20">
            <label className="block text-white text-xs font-bold mb-0.5 shadow-sm text-shadow">Quantity</label>
            <input type="number" defaultValue={1} className="w-full h-8 border border-gray-400 pl-2 text-sm shadow-inner text-center outline-none" />
          </div>
          <button className="h-8 px-3 bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] border border-gray-400 rounded-sm hover:bg-[#e8e8e8] flex flex-col items-center justify-center shadow-sm active:bg-[#ccc]">
            <Search size={14} className="text-gray-600" />
            <span className="text-[9px] font-bold text-gray-700 leading-none mt-0.5">Search</span>
          </button>
        </div>

        {/* Header Row */}
        <div className="flex bg-[#dcebf7] border-b border-[#a0b3c6] text-[#2c4b6e] text-xs font-bold py-1 px-1">
          <div className="w-8 text-center border-r border-[#a0b3c6]">#</div>
          <div className="flex-1 px-2 border-r border-[#a0b3c6]">Item Info</div>
          <div className="w-16 text-center border-r border-[#a0b3c6]">Quantity</div>
          <div className="w-20 text-center">Price</div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 bg-white overflow-y-auto relative">
          <table className="w-full text-xs">
            <tbody>
              {cart.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedItemIndex(idx)}
                  className={`border-b border-gray-200 cursor-pointer ${selectedItemIndex === idx ? 'bg-blue-600 text-white' : (idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f9fd] hover:bg-blue-50')
                    }`}
                >
                  <td className={`w-8 text-center py-2 ${selectedItemIndex === idx ? 'text-white' : 'text-gray-500'}`}>{idx + 1}</td>
                  <td className={`px-2 py-2 font-bold ${selectedItemIndex === idx ? 'text-white' : 'text-[#333]'}`}>{item.name}</td>
                  <td className="w-16 text-center py-2">{item.quantity}</td>
                  <td className="w-20 text-right pr-2 py-2 font-mono">{formatMoney(item.price * item.quantity)}</td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">No items in cart</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions Panel */}
        <div className="h-24 bg-[#cfdbe6] border-t border-[#a0b3c6] p-1 flex gap-1">
          <button
            onClick={handleDeleteItem}
            className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] border border-[#a0a0a0] rounded active:bg-[#ccc] shadow-sm hover:from-[#e8e8e8] hover:to-[#cfcfcf]"
          >
            <X size={24} className="text-red-600 mb-1" />
            <span className="text-[10px] font-bold text-[#333]">DELETE</span>
          </button>
          <button
            onClick={handleDiscountItem}
            className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] border border-[#a0a0a0] rounded active:bg-[#ccc] shadow-sm hover:from-[#e8e8e8] hover:to-[#cfcfcf]"
          >
            <Tag size={24} className="text-blue-600 mb-1" />
            <span className="text-[10px] font-bold text-[#333]">DISCOUNT</span>
            <span className="text-[9px] text-[#555]">Ctrl+L</span>
          </button>
          <button
            onClick={handleDecrementQuantity}
            className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] border border-[#a0a0a0] rounded active:bg-[#ccc] shadow-sm hover:from-[#e8e8e8] hover:to-[#cfcfcf]"
          >
            <Minus size={24} className="text-gray-600 mb-1" />
          </button>
          <button
            onClick={handleQuantityChange}
            className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] border border-[#a0a0a0] rounded active:bg-[#ccc] shadow-sm hover:from-[#e8e8e8] hover:to-[#cfcfcf]"
          >
            <div className="flex"><Minus size={14} /><Plus size={14} /></div>
            <span className="text-[10px] font-bold text-[#333] text-center leading-tight mt-1">QUAN<br />CHANGE</span>
          </button>
          <button
            onClick={handlePriceChange}
            className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] border border-[#a0a0a0] rounded active:bg-[#ccc] shadow-sm hover:from-[#e8e8e8] hover:to-[#cfcfcf]"
          >
            <Percent size={24} className="text-green-600 mb-1" />
            <span className="text-[10px] font-bold text-[#333] text-center leading-tight">PRICE<br />CHANGE</span>
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col bg-[#000]">

        {/* Totals Display (Always Visible) */}
        <div className="h-32 bg-black p-4 flex flex-col justify-center items-end border-b border-gray-800">
          <div className="flex justify-between w-full text-[#00ff00] text-xl font-mono mb-1">
            <span>Sub Total</span>
            <span>{formatMoney(subTotal)}</span>
          </div>
          <div className="flex justify-between w-full text-[#00ff00] text-xl font-mono mb-1">
            <span>Tax</span>
            <span>{formatMoney(tax)}</span>
          </div>
          <div className="flex justify-between w-full text-[#00ff00] text-4xl font-bold font-mono mt-2">
            <span>Grand Total</span>
            <span>{formatMoney(grandTotal)}</span>
          </div>
        </div>

        {rightPanelMode === 'items' ? (
          /* ITEM MODE CONTENT */
          <>
            <div className="flex-1 bg-[#b0c4de] p-1 flex overflow-hidden">
              <div className="w-1/4 flex flex-col gap-1 pr-1 overflow-y-auto">
                <button
                  onClick={() => setSelectedDeptId(null)}
                  className={`h-14 font-bold text-xs rounded shadow-sm border ${selectedDeptId === null ? 'bg-orange-200 border-orange-400 text-black' : 'bg-gradient-to-b from-[#8facca] to-[#7196bc] text-white border-[#5e7d9e]'}`}
                >
                  ALL ITEMS
                </button>
                {departments.map(dept => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`h-14 font-bold text-xs rounded shadow-sm border uppercase break-words px-1 bg-gradient-to-b from-[#a4c2f4] to-[#6d9eeb] text-white border-[#5b8ddc] hover:brightness-110 active:scale-95 transition-all`}
                  >
                    {dept.name}
                  </button>
                ))}
                <button className="h-14 bg-gradient-to-b from-[#a4c2f4] to-[#6d9eeb] text-white font-bold text-xs rounded shadow-sm border border-[#5b8ddc]">MISC ITEMS</button>
              </div>

              <div className="flex-1 bg-white p-1 grid grid-cols-4 grid-rows-5 gap-1 overflow-y-auto content-start">
                {quickItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-[#d9eadf] hover:bg-[#cbebd6] border border-[#a8c6b5] rounded shadow-sm flex flex-col items-center justify-center p-1 active:bg-[#b0d9bd] transition-colors"
                  >
                    <span className="text-[10px] font-bold text-center leading-tight line-clamp-2 text-[#224a35]">{item.name}</span>
                    <span className="text-[10px] text-gray-600 mt-1">{item.sku}</span>
                  </button>
                ))}
                {[...Array(Math.max(0, 20 - quickItems.length))].map((_, i) => (
                  <div key={`empty-${i}`} className="bg-[#f0f0f0] border border-gray-200 rounded opacity-50"></div>
                ))}
              </div>
            </div>

            <div className="h-24 bg-[#b0c4de] p-1 grid grid-cols-4 gap-1">
              <button
                onClick={() => handlePayment('Cash')}
                className="bg-gradient-to-b from-[#a5d6a7] to-[#66bb6a] border border-[#4caf50] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 hover:from-[#bbf2bd] hover:to-[#76cc7a]"
              >
                <Banknote size={24} className="text-[#1b5e20] mb-1" />
                <span className="font-bold text-[#1b5e20] text-xs">Cash</span>
              </button>
              <button
                onClick={() => handlePayment('Check')}
                className="bg-gradient-to-b from-[#a5d6a7] to-[#66bb6a] border border-[#4caf50] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 hover:from-[#bbf2bd] hover:to-[#76cc7a]"
              >
                <FileText size={24} className="text-[#1b5e20] mb-1" />
                <span className="font-bold text-[#1b5e20] text-xs">Check</span>
              </button>
              <button
                onClick={() => handlePayment('Credit')}
                className="bg-gradient-to-b from-[#a5d6a7] to-[#66bb6a] border border-[#4caf50] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 hover:from-[#bbf2bd] hover:to-[#76cc7a]"
              >
                <CreditCard size={24} className="text-[#1b5e20] mb-1" />
                <span className="font-bold text-[#1b5e20] text-xs">Credit</span>
              </button>
              <button
                onClick={() => setRightPanelMode('payment')}
                className="col-span-1 bg-gradient-to-b from-[#90caf9] to-[#42a5f5] border border-[#1e88e5] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90"
              >
                <span className="text-2xl font-black text-[#0d47a1]">PAY</span>
              </button>
            </div>
          </>
        ) : (
          /* PAYMENT MODE CONTENT */
          <div className="flex-1 bg-[#b0c4de] p-2 flex flex-col gap-2 animate-in fade-in duration-200">
            {/* Pay Display */}
            <div className="bg-gradient-to-b from-[#8adeaa] to-[#44b076] border border-[#4caf50] rounded shadow-sm h-20 flex items-center justify-center">
              <span className="text-4xl font-normal text-[#1b5e20] tracking-widest"><span className="underline">P</span>AY</span>
            </div>

            {/* Control Grid */}
            <div className="grid grid-cols-4 gap-2 h-24">
              <button className="bg-gradient-to-b from-[#f8d7da] to-[#f5c6cb] border border-[#f5c6cb] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 hover:from-[#fce8eb] hover:to-[#f8d7da]">
                <span className="text-[#721c24] text-[10px] font-bold text-center leading-tight">VOID<br />INVOICE</span>
                <span className="text-[9px] text-[#721c24] mt-0.5">Ctrl+V</span>
              </button>
              <button className="bg-gradient-to-b from-[#fff3cd] to-[#ffeeba] border border-[#ffeeba] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 hover:from-[#fff9e6] hover:to-[#fff3cd]">
                <span className="text-[#856404] text-[10px] font-bold">HOLD</span>
                <span className="text-[9px] text-[#856404] mt-0.5">Ctrl+H</span>
              </button>
              <button className="bg-gradient-to-b from-[#ffe5d0] to-[#fccba8] border border-[#fccba8] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 hover:from-[#fff0e3] hover:to-[#ffe5d0]">
                <Barcode size={24} className="text-[#b5580e] mb-1" />
                <span className="text-[#b5580e] text-[10px] font-bold">TS Lookup</span>
              </button>
              <button className="bg-gradient-to-b from-[#cce5ff] to-[#b8daff] border border-[#b8daff] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 hover:from-[#e3f0ff] hover:to-[#cce5ff]">
                <span className="text-[#004085] text-[10px] font-bold">Options</span>
              </button>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-4 gap-2 h-24">
              <button onClick={() => handlePayment('Cash')} className="bg-gradient-to-b from-[#a5d6a7] to-[#66bb6a] border border-[#4caf50] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 group hover:from-[#bbf2bd] hover:to-[#76cc7a]">
                <Banknote size={28} className="text-[#1b5e20] mb-1 drop-shadow-sm" />
                <span className="text-[#1b5e20] text-[10px] font-bold">CASH</span>
              </button>
              <button onClick={() => handlePayment('Check')} className="bg-gradient-to-b from-[#a4c2f4] to-[#6d9eeb] border border-[#5b8ddc] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 group hover:from-[#bfd6fa] hover:to-[#7eb2ff]">
                <FileText size={28} className="text-[#1c4587] mb-1 drop-shadow-sm" />
                <span className="text-[#1c4587] text-[10px] font-bold">CHECK</span>
              </button>
              <button onClick={() => handlePayment('Credit')} className="bg-gradient-to-b from-[#a4c2f4] to-[#6d9eeb] border border-[#5b8ddc] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 group hover:from-[#bfd6fa] hover:to-[#7eb2ff]">
                <CreditCard size={28} className="text-[#1c4587] mb-1 drop-shadow-sm" />
                <span className="text-[#1c4587] text-[10px] font-bold text-center leading-tight">CREDIT<br />DEBIT</span>
              </button>
              <button onClick={() => handlePayment('Account')} className="bg-gradient-to-b from-[#fce5cd] to-[#f9cb9c] border border-[#f9cb9c] rounded shadow-sm flex flex-col items-center justify-center active:brightness-90 group hover:from-[#ffeeda] hover:to-[#fcdab5]">
                <Scale size={28} className="text-[#7f6000] mb-1 drop-shadow-sm" />
                <span className="text-[#7f6000] text-[10px] font-bold">ACCOUNT</span>
              </button>
            </div>

            <div className="flex-1 bg-[#d0e0f0] rounded border border-[#a0b3c6] flex overflow-hidden shadow-inner mt-4">
              {/* Find Buttons */}
              <div className="w-24 bg-[#f9cb9c] border-r border-[#a0b3c6] flex flex-col">
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="flex-1 flex flex-col items-center justify-center border-b border-[#e6b8af] hover:bg-[#ffeacc] active:brightness-95"
                >
                  <Users size={20} className="text-[#7f6000] mb-1" />
                  <span className="text-[#7f6000] text-[10px] font-bold">FIND</span>
                </button>
                <button className="flex-1 flex flex-col items-center justify-center hover:bg-[#ffeacc] active:brightness-95">
                  <Barcode size={20} className="text-[#7f6000] mb-1" />
                  <span className="text-[#7f6000] text-[10px] font-bold text-center leading-tight">QUICK<br />FIND</span>
                </button>
              </div>
              {/* Customer Info Display */}
              <div className="flex-1 bg-gradient-to-b from-[#dcebf7] to-[#c5dff2] p-2 relative">
                <div className="absolute top-2 right-2 text-[#2c4b6e] font-bold text-sm">Customer Info</div>
                <div className="mt-8 text-[#555] text-sm font-bold">
                  {selectedCustomer ? (
                    <>
                      {selectedCustomer.customerNumber || selectedCustomer.id.substring(0, 6)} - {selectedCustomer.firstName} {selectedCustomer.lastName}
                      <div className="text-xs font-normal mt-1">{selectedCustomer.company}</div>
                    </>
                  ) : (
                    "101 - Cash Customer"
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <button
                onClick={() => setRightPanelMode('items')}
                className="w-full bg-gradient-to-b from-[#e0e0e0] to-[#c0c0c0] border border-[#a0a0a0] rounded shadow-sm py-2 font-bold text-gray-700 active:brightness-90"
              >
                BACK TO ITEMS
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showCustomerModal && (
        <CustomerSelectionModal
          onSelect={(c) => setSelectedCustomer(c)}
          onClose={() => setShowCustomerModal(false)}
        />
      )}

      export const Sales: React.FC<SalesProps> = ({items, transactions, onAddTransaction, onDeleteTransaction, settings}) => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
        const [expandedId, setExpandedId] = useState<string | null>(null);
        const [deleteBatchId, setDeleteBatchId] = useState<string | null>(null);
        const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

        // Form State
        const [entries, setEntries] = useState<{ itemId: string, quantity: number, price: number }[]>([
        {itemId: '', quantity: 1, price: 0 }
        ]);
        const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fmt = (val: number) => new Intl.NumberFormat(settings.locale, {
          style: 'currency',
        currency: settings.currency
  }).format(val);

  // Group transactions by batchId
  const salesBatches = useMemo(() => {
    const groups: Record<string, Transaction[]> = { };
        transactions
      .filter(t => t.type === 'sale')
      .forEach(t => {
        const bid = t.batchId || t.id;
        if (!groups[bid]) groups[bid] = [];
        groups[bid].push(t);
      });

        return Object.entries(groups)
      .map(([bid, batchItems]) => ({
          id: bid,
        date: batchItems[0].date,
        totalQuantity: batchItems.reduce((sum, i) => sum + i.quantity, 0),
        totalAmount: batchItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0),
        items: batchItems
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const addRow = () => setEntries([...entries, {itemId: '', quantity: 1, price: 0 }]);
  const removeRow = (idx: number) => setEntries(entries.filter((_, i) => i !== idx));

  const updateEntry = (idx: number, field: string, value: any) => {
    const newEntries = [...entries];
        newEntries[idx] = {...newEntries[idx], [field]: value };
        if (field === 'itemId') {
      const item = items.find(i => i.id === value);
        if (item) newEntries[idx].price = item.sellingPrice;
    }
        setEntries(newEntries);
  };

  const handleOpenEdit = (batch: any) => {
          setEditingBatchId(batch.id);
        setDate(batch.date);
    setEntries(batch.items.map((t: Transaction) => ({
          itemId: t.itemId,
        quantity: t.quantity,
        price: t.unitPrice
    })));
        setView('edit');
  };

  const handleDeleteBatch = () => {
    if (!deleteBatchId) return;
    const batch = salesBatches.find(b => b.id === deleteBatchId);
        if (batch) {
          batch.items.forEach(t => onDeleteTransaction(t.id));
    }
        setDeleteBatchId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();

        // If editing, we delete the old batch first to revert stock correctly, then re-add
        if (view === 'edit' && editingBatchId) {
      const oldBatch = salesBatches.find(b => b.id === editingBatchId);
        if (oldBatch) {
          oldBatch.items.forEach(t => onDeleteTransaction(t.id));
      }
    }

        const batchId = `sale-${Date.now()}`;
    entries.forEach(entry => {
      if (entry.itemId && entry.quantity > 0) {
          onAddTransaction({
            batchId,
            date,
            type: 'sale',
            itemId: entry.itemId,
            quantity: entry.quantity,
            unitPrice: entry.price,
            remarks: 'Standard Sale'
          });
      }
    });

        setEntries([{itemId: '', quantity: 1, price: 0 }]);
        setView('list');
        setEditingBatchId(null);
  };

  const handleOpenAdd = () => {
          setEditingBatchId(null);
        setEntries([{itemId: '', quantity: 1, price: 0 }]);
        setDate(new Date().toISOString().split('T')[0]);
        setView('add');
  };

        if (view === 'add' || view === 'edit') {
    return (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-purple-100 border border-gray-100">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-2xl">
                  <ShoppingCart className="text-[#8E54E9]" size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                    {view === 'edit' ? 'Edit Sale' : 'New Sale'}
                  </h2>
                  <p className="text-gray-400 font-medium">
                    {view === 'edit' ? 'Update existing transaction details.' : 'Record a new customer transaction.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setView('list')}
                className="p-3 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-50 transition-all"
              >
                <X size={32} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="max-w-xs">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Transaction Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-200 rounded-2xl font-bold text-gray-700 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {entries.map((entry, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100 relative group transition-all hover:bg-white hover:shadow-lg">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Select Product</label>
                      <select
                        required
                        value={entry.itemId}
                        onChange={(e) => updateEntry(idx, 'itemId', e.target.value)}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl py-3.5 px-4 text-sm focus:border-[#8E54E9] font-bold outline-none transition-all"
                      >
                        <option value="">Choose...</option>
                        {items.map(item => (
                          <option key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={entry.quantity}
                        onChange={(e) => updateEntry(idx, 'quantity', Number(e.target.value))}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl py-3.5 px-4 text-sm focus:border-[#8E54E9] font-bold outline-none transition-all"
                      />
                    </div>
                    <div className="w-full md:w-40">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Price / Unit</label>
                      <input
                        type="number"
                        value={entry.price}
                        onChange={(e) => updateEntry(idx, 'price', Number(e.target.value))}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl py-3.5 px-4 text-sm focus:border-[#8E54E9] font-bold outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="p-3.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-8 border-t pt-10 mt-10">
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center text-sm font-black text-[#8E54E9] hover:bg-purple-50 px-8 py-4 rounded-2xl transition-all active:scale-95 border-2 border-purple-100"
                >
                  <Plus size={20} className="mr-2" />
                  Add Line Item
                </button>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Grand Total</span>
                    <p className="text-4xl font-black text-gray-800">
                      {fmt(entries.reduce((acc, e) => acc + (e.quantity * e.price), 0))}
                    </p>
                  </div>
                  <button type="submit" className="bg-[#8E54E9] text-white px-10 py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-purple-200 hover:bg-[#7c47d3] transition-all active:scale-95">
                    {view === 'edit' ? 'Update Sale' : 'Save Sale'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        );
  }

        return (
        <div className="animate-in fade-in duration-700">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
            {/* Table Header matching screenshot */}
            <div className="p-8 pb-4 flex items-center justify-start gap-4">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Sales</h2>
              <button
                onClick={handleOpenAdd}
                className="bg-[#8E54E9] text-white px-5 py-2.5 rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-[#7c47d3] transition-all active:scale-95 shadow-sm"
              >
                <Plus size={14} strokeWidth={4} />
                Add New
              </button>
            </div>

            <div className="overflow-x-auto p-2">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="text-gray-900 font-bold text-[13px]">
                  <tr className="border-b border-gray-100">
                    <th className="px-8 py-6 w-12 text-center"></th>
                    <th className="px-6 py-6 text-center">ID</th>
                    <th className="px-6 py-6 text-center">Date</th>
                    <th className="px-6 py-6 text-center">Total Quantity</th>
                    <th className="px-6 py-6 text-center">Total Amount</th>
                    <th className="px-10 py-6 text-right w-40"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {salesBatches.map((batch, index) => {
                    const displayId = salesBatches.length - index + 61;

                    return (
                      <React.Fragment key={batch.id}>
                        <tr
                          className={`hover:bg-purple-50/10 transition-all group cursor-pointer ${expandedId === batch.id ? 'bg-purple-50/20' : ''}`}
                          onClick={() => setExpandedId(expandedId === batch.id ? null : batch.id)}
                        >
                          <td className="px-8 py-6">
                            <div className={`transition-all duration-300 text-gray-400 group-hover:text-[#8E54E9] ${expandedId === batch.id ? 'rotate-90 text-[#8E54E9]' : ''}`}>
                              <ChevronRight size={18} strokeWidth={2.5} />
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center text-gray-500 font-bold">
                            {displayId}
                          </td>
                          <td className="px-6 py-6 text-center text-gray-500 font-bold">
                            {new Date(batch.date).toLocaleDateString(settings.locale)}
                          </td>
                          <td className="px-6 py-6 text-center text-gray-800 font-bold">
                            {batch.totalQuantity}
                          </td>
                          <td className="px-6 py-6 text-center text-gray-900 font-black">
                            {fmt(batch.totalAmount)}
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex justify-end items-center gap-3" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setDeleteBatchId(batch.id)}
                                className="w-10 h-10 flex items-center justify-center bg-[#FF4D4D] text-white rounded-xl hover:bg-red-600 transition-all shadow-sm active:scale-90"
                              >
                                <Trash2 size={20} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(batch)}
                                className="w-10 h-10 flex items-center justify-center bg-[#4ADE80] text-white rounded-xl hover:bg-green-500 transition-all shadow-sm active:scale-90"
                              >
                                <Edit2 size={20} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === batch.id && (
                          <tr className="bg-gray-50/40">
                            <td colSpan={6} className="px-16 py-8 border-b border-gray-100">
                              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                                <div className="flex items-center gap-2 mb-6">
                                  <Package className="text-[#8E54E9]" size={18} />
                                  <h4 className="text-[11px] font-black text-[#8E54E9] uppercase tracking-widest">Sale Itemization</h4>
                                </div>
                                <table className="w-full text-xs">
                                  <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                    <tr>
                                      <th className="pb-4 text-left">Product Name</th>
                                      <th className="pb-4 text-center">Qty</th>
                                      <th className="pb-4 text-right">Unit Price</th>
                                      <th className="pb-4 text-right">Line Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {batch.items.map(t => {
                                      const item = items.find(i => i.id === t.itemId);
                                      return (
                                        <tr key={t.id} className="text-gray-600">
                                          <td className="py-4 font-bold text-gray-800">{item?.name || 'Unknown Product'}</td>
                                          <td className="py-4 text-center font-bold">{t.quantity}</td>
                                          <td className="py-4 text-right">{fmt(t.unitPrice)}</td>
                                          <td className="py-4 text-right font-black text-gray-900">{fmt(t.quantity * t.unitPrice)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteBatchId && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 border-4 border-red-50/50">
                    <AlertTriangle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">Void this Sale?</h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-8">
                    Deleting this record will restore the original stock levels for all products in this transaction. This action cannot be undone.
                  </p>
                  <div className="flex gap-4 w-full">
                    <button
                      onClick={() => setDeleteBatchId(null)}
                      className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                    >
                      No, Cancel
                    </button>
                    <button
                      onClick={handleDeleteBatch}
                      className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-red-200 active:scale-95"
                    >
                      Yes, Void Sale
                    </button>
                  </div>
                </div>
              </div>
            </div>
>>>>>>> a254259620f923355458ce63cc6f910198ac07aa
          )}
        </div>
        );
};
