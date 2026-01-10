
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CreditCard, Calendar } from 'lucide-react';
import { Settlement } from '../types';
import { api } from '../services/api';

export const SettlementManager: React.FC = () => {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.getSettlements();
            setSettlements(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this settlement record?')) return;
        try {
            await api.deleteSettlement(id);
            loadData();
        } catch (e) { alert('Failed to delete'); }
    };

    const filteredSettlements = settlements.filter(s =>
        (s.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full bg-slate-50 flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Credit Card Settlements</h1>
                    <p className="text-slate-500 font-medium">Record and track daily credit card settlements.</p>
                </div>
                <button
                    onClick={() => { setEditingSettlement(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> New Settlement
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Total Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSettlements.map(settlement => (
                                <tr key={settlement.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 text-slate-800 font-bold flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Calendar size={20} />
                                        </div>
                                        {settlement.settlementDate}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800 text-lg">
                                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(settlement.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${settlement.status === 'Settled' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                            {settlement.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm max-w-xs truncate">
                                        {settlement.notes || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingSettlement(settlement); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(settlement.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSettlements.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-400">No settlements recorded.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <SettlementFormModal
                    settlement={editingSettlement}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadData(); }}
                />
            )}
        </div>
    );
};

interface SettlementFormModalProps {
    settlement: Settlement | null;
    onClose: () => void;
    onSave: () => void;
}

const SettlementFormModal: React.FC<SettlementFormModalProps> = ({ settlement, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Settlement>>({
        settlementDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        status: 'Pending',
        notes: ''
    });

    useEffect(() => {
        if (settlement) {
            setFormData(settlement);
        }
    }, [settlement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (settlement) await api.updateSettlement(formData as Settlement);
            else await api.createSettlement(formData as Settlement);
            onSave();
        } catch (e) { alert('Failed to save settlement'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{settlement ? 'Edit Settlement' : 'New Settlement'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Settlement Date</label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-200 rounded-lg"
                            value={formData.settlementDate}
                            onChange={e => setFormData({ ...formData, settlementDate: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Total Settled Amount (£)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full p-3 border border-slate-200 rounded-lg text-lg font-bold"
                            value={formData.totalAmount}
                            onChange={e => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Settled">Settled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Notes (Optional)</label>
                        <textarea
                            className="w-full p-3 border border-slate-200 rounded-lg h-24 resize-none"
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="e.g. Terminal #1 batch close"
                        />
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">Save Record</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
