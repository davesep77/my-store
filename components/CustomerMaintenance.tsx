
import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { api } from '../services/api';
import { Plus, Edit, Trash, User, Search, Phone, Mail, MapPin } from 'lucide-react';

export const CustomerMaintenance: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const [formData, setFormData] = useState<Partial<Customer>>({});

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await api.getCustomers();
            setCustomers(data);
        } catch (err) {
            console.error(err);
            alert('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData(customer);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingCustomer(null);
        setFormData({});
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await api.deleteCustomer(id);
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete customer');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName) return alert('Name is required');

        try {
            if (editingCustomer) {
                await api.updateCustomer(formData as Customer);
            } else {
                await api.createCustomer({
                    ...formData,
                    id: Math.random().toString(36).substr(2, 9),
                    dateAdded: new Date().toISOString().split('T')[0]
                } as Customer);
            }
            setShowModal(false);
            fetchCustomers();
        } catch (err) {
            console.error(err);
            alert('Failed to save customer');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Customer Maintenance
                    </h2>
                    <p className="text-gray-500 text-sm">Manage customer profiles and history</p>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Customer
                    </button>
                </div>
            </div>

            {/* Grid List */}
            <div className="flex-1 overflow-auto rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCustomers.map(customer => (
                        <div key={customer.id} className="p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-all bg-white group select-none">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {customer.firstName[0]}{customer.lastName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{customer.firstName} {customer.lastName}</h3>
                                        <p className="text-xs text-gray-400">ID: {customer.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(customer)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(customer.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash size={16} /></button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                {customer.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <span className="truncate">{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin size={14} className="text-gray-400 mt-0.5" />
                                        <span className="line-clamp-2 text-xs">{customer.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <User size={48} className="mb-4 opacity-20" />
                        <p>No customers found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">
                            {editingCustomer ? 'Edit Customer' : 'New Customer'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
                                    <input
                                        required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.firstName || ''}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                                    <input
                                        required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.lastName || ''}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                    <input
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    value={formData.notes || ''}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Save Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
