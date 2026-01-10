
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Customer } from '../types';
import { api } from '../services/api';

interface CustomerFormModalProps {
    customer?: Customer; // If present, we are editing
    onSave: () => void;
    onClose: () => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ customer, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Customer>>({
        customerNumber: '',
        firstName: '',
        lastName: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        notes: ''
    });

    useEffect(() => {
        if (customer) {
            setFormData(customer);
        } else {
            // Generate a random customer number for new customers if needed, or leave blank
            setFormData(prev => ({ ...prev, customerNumber: Math.floor(Math.random() * 10000).toString() }));
        }
    }, [customer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (customer && customer.id) {
                await api.updateCustomer({ ...formData, id: customer.id } as Customer);
            } else {
                await api.createCustomer(formData as Omit<Customer, 'id'>);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to save customer", error);
            alert("Failed to save customer");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#e0f7fa] w-full max-w-2xl rounded-lg shadow-2xl border-2 border-[#0096c7] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-4 py-3 flex justify-between items-center shadow-md">
                    <span className="font-bold text-xl tracking-wide drop-shadow-sm">{customer ? 'Edit Customer' : 'Add New Customer'}</span>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">Customer #</label>
                            <input
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.customerNumber || ''}
                                onChange={e => setFormData({ ...formData, customerNumber: e.target.value })}
                                placeholder="Auto-generated"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">Company</label>
                            <input
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.company || ''}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">First Name *</label>
                            <input
                                required
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.firstName || ''}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">Last Name *</label>
                            <input
                                required
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.lastName || ''}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">Phone</label>
                            <input
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.phone || ''}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.email || ''}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#023e8a] mb-1">Address</label>
                        <input
                            className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">City</label>
                            <input
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.city || ''}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">State</label>
                            <input
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.state || ''}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#023e8a] mb-1">Zip Code</label>
                            <input
                                className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none"
                                value={formData.zipCode || ''}
                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#023e8a] mb-1">Notes</label>
                        <textarea
                            className="w-full p-2 border border-[#90e0ef] rounded bg-white text-sm focus:ring-2 focus:ring-[#00b4d8] outline-none resize-none h-20"
                            value={formData.notes || ''}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#caf0f8]">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded bg-gradient-to-b from-[#48cae4] to-[#0077b6] text-white font-bold shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                            <Save size={18} /> Save Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
