
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, UserCircle } from 'lucide-react';
import { Employee } from '../types';
import { api } from '../services/api';

export const EmployeeMaintenance: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await api.getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            await api.deleteEmployee(id);
            fetchEmployees();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredEmployees = employees.filter(e =>
        e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id.includes(searchTerm)
    );

    return (
        <div className="h-full bg-slate-50 flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Employee Maintenance</h1>
                    <p className="text-slate-500 font-medium">Manage staff profiles, roles, and access.</p>
                </div>
                <button
                    onClick={() => { setEditingEmployee(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Add Employee
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-slate-600">{emp.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                {emp.firstName[0]}{emp.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{emp.firstName} {emp.lastName}</div>
                                                <div className="text-xs text-slate-400">{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.role === 'Manager' ? 'bg-purple-100 text-purple-700' :
                                                emp.role === 'Cashier' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`w-2 h-2 rounded-full inline-block mr-2 ${emp.isActive ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                        <span className="text-sm font-medium text-slate-600">{emp.isActive ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingEmployee(emp); setShowModal(true); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400">
                                        <UserCircle size={48} className="mx-auto mb-4 opacity-50" />
                                        No employees found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <EmployeeFormModal
                    employee={editingEmployee}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchEmployees(); }}
                />
            )}
        </div>
    );
};

interface EmployeeFormModalProps {
    employee: Employee | null;
    onClose: () => void;
    onSave: () => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ employee, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Employee>>({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        role: 'Staff',
        pinCode: '',
        hourlyRate: 0,
        isActive: true
    });

    useEffect(() => {
        if (employee) {
            setFormData(employee);
        } else {
            // Generate ID
            setFormData(prev => ({ ...prev, id: Math.floor(Math.random() * 9000 + 1000).toString() }));
        }
    }, [employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (employee) {
                await api.updateEmployee(formData as Employee);
            } else {
                await api.createEmployee(formData as Employee);
            }
            onSave();
        } catch (error) {
            console.error(error);
            alert('Failed to save employee');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{employee ? 'Edit Employee' : 'New Employee'}</h2>
                    <button onClick={onClose}><Edit2 size={24} className="opacity-0" /><span className="text-slate-400 font-bold text-lg hover:text-slate-600">✕</span></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Employee ID</label>
                            <input
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                                value={formData.id}
                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                                readOnly={!!employee}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">PIN Code</label>
                            <input
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.pinCode || ''}
                                onChange={e => setFormData({ ...formData, pinCode: e.target.value })}
                                placeholder="****"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                            <input
                                required
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.firstName || ''}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                            <input
                                required
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.lastName || ''}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                            <select
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                            >
                                <option value="Staff">Staff</option>
                                <option value="Cashier">Cashier</option>
                                <option value="Manager">Manager</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Hourly Rate</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.hourlyRate || ''}
                                    onChange={e => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                        <textarea
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={2}
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            checked={formData.isActive}
                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label htmlFor="isActive" className="font-bold text-slate-700">Active Employee</label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            Save Employee
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
