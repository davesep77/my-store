
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Grid, Layers } from 'lucide-react';
import { Style, Item } from '../types';
import { api } from '../services/api';

export const StylesMatrix: React.FC = () => {
    const [styles, setStyles] = useState<Style[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStyle, setEditingStyle] = useState<Style | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [s, i] = await Promise.all([api.getStyles(), api.getItems()]);
            setStyles(s);
            setItems(i);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this style definition?')) return;
        try {
            await api.deleteStyle(id);
            loadData();
        } catch (e) { alert('Failed to delete'); }
    };

    const filteredStyles = styles.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full bg-slate-50 flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Styles Matrix</h1>
                    <p className="text-slate-500 font-medium">Define product variants (Size, Color, etc.).</p>
                </div>
                <button
                    onClick={() => { setEditingStyle(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> New Style Rule
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search styles..."
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
                                <th className="px-6 py-4">Style Name</th>
                                <th className="px-6 py-4">Base Product Item</th>
                                <th className="px-6 py-4">Defined Variants</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStyles.map(style => (
                                <tr key={style.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Grid size={20} />
                                        </div>
                                        {style.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {style.baseItemName || <span className="text-slate-300 italic">None linked</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {style.variants?.slice(0, 4).map((v, i) => (
                                                <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-200">
                                                    {v.variantName}: {v.variantValue}
                                                </span>
                                            ))}
                                            {(style.variants?.length || 0) > 4 && (
                                                <span className="px-2 py-1 bg-slate-50 rounded text-xs font-bold text-slate-400">
                                                    +{style.variants!.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingStyle(style); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(style.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStyles.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-slate-400">No styles defined.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <StyleFormModal
                    style={editingStyle}
                    items={items}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadData(); }}
                />
            )}
        </div>
    );
};

interface StyleFormModalProps {
    style: Style | null;
    items: Item[];
    onClose: () => void;
    onSave: () => void;
}

const StyleFormModal: React.FC<StyleFormModalProps> = ({ style, items, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Style>>({
        id: '', name: '', baseItemId: '', variants: []
    });

    useEffect(() => {
        if (style) {
            setFormData(JSON.parse(JSON.stringify(style)));
        } else {
            setFormData(prev => ({ ...prev, id: 'STYLE-' + Math.floor(Math.random() * 10000) }));
        }
    }, [style]);

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...(prev.variants || []), { id: 0, styleId: prev.id!, variantName: 'Size', variantValue: '', skuModifier: '' }]
        }));
    };

    const removeVariant = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants?.filter((_, i) => i !== idx)
        }));
    };

    const updateVariant = (idx: number, field: string, value: string) => {
        const newVars = [...(formData.variants || [])];
        // @ts-ignore
        newVars[idx] = { ...newVars[idx], [field]: value };
        setFormData({ ...formData, variants: newVars });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (style) await api.updateStyle(formData as Style);
            else await api.createStyle(formData as Style);
            onSave();
        } catch (e) { alert('Failed to save style'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{style ? 'Edit Style Rule' : 'New Style Rule'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Style ID</label>
                            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono" value={formData.id} readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Style Name</label>
                            <input required className="w-full p-3 border border-slate-200 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Men's T-Shirt" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Base Inventory Item (Optional)</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                            value={formData.baseItemId}
                            onChange={e => setFormData({ ...formData, baseItemId: e.target.value })}
                        >
                            <option value="">-- Link to existing item --</option>
                            {items.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Linking to a base item allows you to associate generated SKUs with a parent product.</p>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Layers size={18} /> Variant Definitions</h3>
                            <button type="button" onClick={addVariant} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">+ Add Variant</button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                                <div className="col-span-3">Type</div>
                                <div className="col-span-4">Value</div>
                                <div className="col-span-4">SKU Modifier</div>
                                <div className="col-span-1"></div>
                            </div>
                            {formData.variants?.map((v, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    <div className="col-span-3">
                                        <select
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                                            value={v.variantName}
                                            onChange={e => updateVariant(idx, 'variantName', e.target.value)}
                                        >
                                            <option value="Size">Size</option>
                                            <option value="Color">Color</option>
                                            <option value="Material">Material</option>
                                            <option value="Style">Style</option>
                                        </select>
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                            value={v.variantValue}
                                            onChange={e => updateVariant(idx, 'variantValue', e.target.value)}
                                            placeholder="e.g. XL, Red"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-mono"
                                            value={v.skuModifier}
                                            onChange={e => updateVariant(idx, 'skuModifier', e.target.value)}
                                            placeholder="e.g. -XL"
                                        />
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {(!formData.variants || formData.variants.length === 0) && (
                                <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                                    No variants defined. Add one above.
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">Save Style</button>
                </div>
            </div>
        </div>
    );
};
