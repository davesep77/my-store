import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Item } from '../types';
import { Save, RefreshCw, Calculator, ArrowUp, ArrowDown, CheckSquare, Square } from 'lucide-react';

const GlobalPricingManager: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Adjustment State
    const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
    const [adjustmentType, setAdjustmentType] = useState<'percent' | 'fixed'>('percent'); // percent or fixed
    const [operation, setOperation] = useState<'increase' | 'decrease'>('increase');
    const [roundTo99, setRoundTo99] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await api.getItems();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateNewPrice = (currentPrice: number) => {
        let newPrice = Number(currentPrice);
        const value = Number(adjustmentValue);

        if (adjustmentType === 'percent') {
            const delta = currentPrice * (value / 100);
            newPrice = operation === 'increase' ? currentPrice + delta : currentPrice - delta;
        } else {
            newPrice = operation === 'increase' ? currentPrice + value : currentPrice - value;
        }

        if (roundTo99) {
            newPrice = Math.floor(newPrice) + 0.99;
        }

        return Math.max(0, parseFloat(newPrice.toFixed(2)));
    };

    const previewItems = useMemo(() => {
        return items.map(item => {
            const isSelected = selectedIds.has(item.id);
            const newPrice = isSelected ? calculateNewPrice(Number(item.sellingPrice)) : Number(item.sellingPrice);
            const diff = newPrice - Number(item.sellingPrice);
            return {
                ...item,
                currentPrice: Number(item.sellingPrice),
                newPrice,
                diff,
                isSelected
            };
        }).filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, selectedIds, adjustmentValue, adjustmentType, operation, roundTo99, searchTerm]);

    const handleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(items.map(i => i.id));
            setSelectedIds(allIds);
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const applyChanges = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Are you sure you want to update prices for ${selectedIds.size} items?`)) return;

        setSaving(true);
        try {
            const updates = previewItems
                .filter(i => i.isSelected)
                .map(i => ({ id: i.id, price: i.newPrice }));

            await api.bulkUpdatePrices(updates);
            await loadItems();
            setSelectedIds(new Set());
            alert('Prices updated successfully!');
        } catch (err) {
            alert('Failed to update prices');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading items...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Calculator className="w-8 h-8 text-blue-600" />
                    Global Pricing Manager
                </h1>
                <button
                    onClick={loadItems}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Refresh Items"
                >
                    <RefreshCw size={24} />
                </button>
            </div>

            {/* Controls Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">

                    {/* Operation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setOperation('increase')}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 border transition-all ${operation === 'increase'
                                    ? 'bg-green-50 border-green-200 text-green-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <ArrowUp size={16} /> Increase
                            </button>
                            <button
                                onClick={() => setOperation('decrease')}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 border transition-all ${operation === 'decrease'
                                    ? 'bg-red-50 border-red-200 text-red-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <ArrowDown size={16} /> Decrease
                            </button>
                        </div>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setAdjustmentType('percent')}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${adjustmentType === 'percent'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Percentage (%)
                            </button>
                            <button
                                onClick={() => setAdjustmentType('fixed')}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${adjustmentType === 'fixed'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Fixed Amount (£)
                            </button>
                        </div>
                    </div>

                    {/* Value */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Value {adjustmentType === 'percent' ? '(%)' : '(£)'}
                        </label>
                        <input
                            type="number"
                            min="0"
                            step={adjustmentType === 'percent' ? '1' : '0.01'}
                            value={adjustmentValue}
                            onChange={(e) => setAdjustmentValue(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                        />
                    </div>

                    {/* Options */}
                    <div className="pb-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div
                                className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${roundTo99 ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                    }`}
                                onClick={() => setRoundTo99(!roundTo99)}
                            >
                                {roundTo99 && <CheckSquare className="text-white w-3.5 h-3.5" />}
                            </div>
                            <span className="text-gray-700 select-none">Round to .99</span>
                        </label>
                    </div>

                    {/* Apply Button */}
                    <div>
                        <button
                            onClick={applyChanges}
                            disabled={selectedIds.size === 0 || saving || adjustmentValue === 0}
                            className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${selectedIds.size > 0 && adjustmentValue > 0
                                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Save size={18} />
                            {saving ? 'Applying...' : `Apply to ${selectedIds.size} Items`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Showing {previewItems.length} items
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-200">
                                <th className="p-4 w-12 text-center">
                                    <button onClick={handleSelectAll} className="opacity-60 hover:opacity-100">
                                        {selectedIds.size > 0 && selectedIds.size === items.length ? (
                                            <CheckSquare size={20} className="text-blue-600" />
                                        ) : (
                                            <Square size={20} />
                                        )}
                                    </button>
                                </th>
                                <th className="p-4">SKU</th>
                                <th className="p-4">Product Name</th>
                                <th className="p-4 text-right">Cost</th>
                                <th className="p-4 text-right">Current Price</th>
                                <th className="p-4 text-right bg-blue-50/30">New Price</th>
                                <th className="p-4 text-right">Difference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {previewItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`hover:bg-gray-50 transition-colors ${item.isSelected ? 'bg-blue-50/10' : ''}`}
                                    onClick={() => toggleSelection(item.id)}
                                >
                                    <td className="p-4 text-center cursor-pointer">
                                        <div className={`w-5 h-5 border-2 rounded mx-auto flex items-center justify-center transition-colors ${selectedIds.has(item.id)
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedIds.has(item.id) && <CheckSquare className="text-white w-3.5 h-3.5" />}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 font-mono text-sm">{item.sku}</td>
                                    <td className="p-4 font-medium text-gray-800">{item.name}</td>
                                    <td className="p-4 text-right text-gray-500">£{Number(item.unitCost).toFixed(2)}</td>
                                    <td className="p-4 text-right font-medium text-gray-700">£{item.currentPrice.toFixed(2)}</td>
                                    <td className={`p-4 text-right font-bold bg-blue-50/30 ${item.diff > 0 ? 'text-green-600' : item.diff < 0 ? 'text-red-600' : 'text-gray-800'
                                        }`}>
                                        £{item.newPrice.toFixed(2)}
                                    </td>
                                    <td className={`p-4 text-right text-sm ${item.diff > 0 ? 'text-green-600' : item.diff < 0 ? 'text-red-600' : 'text-gray-400'
                                        }`}>
                                        {item.diff !== 0 && (item.diff > 0 ? '+' : '')}
                                        {item.diff !== 0 && `£${item.diff.toFixed(2)}`}
                                    </td>
                                </tr>
                            ))}
                            {previewItems.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No items found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GlobalPricingManager;
