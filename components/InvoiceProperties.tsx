
import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { api } from '../services/api';
import { Save, ArrowLeft } from 'lucide-react';

interface InvoicePropertiesProps {
    onNavigate: (tab: 'management') => void;
}

export const InvoiceProperties: React.FC<InvoicePropertiesProps> = ({ onNavigate }) => {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getSettings().then(res => {
            setSettings(res);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        try {
            await api.updateSettings(settings); // This API might need updating to handle full object, currently it likely matches backend
            alert("Invoice properties saved!");
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        }
    };

    if (loading || !settings) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('management')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Invoice Properties</h1>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-auto max-w-4xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 space-y-6">

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Next Invoice Number</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={settings.nextInvoiceNumber || ''}
                                onChange={e => setSettings({ ...settings, nextInvoiceNumber: parseInt(e.target.value) })}
                            />
                            <p className="text-xs text-slate-400 mt-1">This number will increment automatically.</p>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Default Tax Rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={settings.taxRate || 0}
                                onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Header</label>
                        <textarea
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
                            placeholder="Enter company name, address, etc."
                            value={settings.invoiceHeader || ''}
                            onChange={e => setSettings({ ...settings, invoiceHeader: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Terms & Conditions</label>
                        <textarea
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
                            placeholder="e.g. Payment due within 30 days."
                            value={settings.invoiceTerms || ''}
                            onChange={e => setSettings({ ...settings, invoiceTerms: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Footer</label>
                        <input
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g. Thank you for your business!"
                            value={settings.invoiceFooter || ''}
                            onChange={e => setSettings({ ...settings, invoiceFooter: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                            <Save size={20} />
                            Save Properties
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
