
import React, { useState, useEffect } from 'react';
import { Department } from '../types';
import { api } from '../services/api';
import { Plus, Edit, Trash, Save, X } from 'lucide-react';

interface DepartmentMaintenanceProps {
    onAssignToItem?: (deptId: string) => void;
}

export const DepartmentMaintenance: React.FC<DepartmentMaintenanceProps> = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Department>>({});

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const data = await api.getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error(err);
            alert('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleEdit = (dept: Department) => {
        setEditingId(dept.id);
        setFormData(dept);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this department? Items in this department will remain but lose the association.')) return;
        try {
            await api.deleteDepartment(id);
            fetchDepartments();
        } catch (err) {
            console.error(err);
            alert('Failed to delete department');
        }
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required');
        try {
            if (editingId) {
                await api.updateDepartment(formData as Department);
            } else {
                await api.createDepartment({ ...formData, id: Math.random().toString(36).substr(2, 9) } as Department);
            }
            setEditingId(null);
            setFormData({});
            fetchDepartments();
        } catch (err) {
            console.error(err);
            alert('Failed to save department');
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Department Maintenance
                    </h2>
                    <p className="text-gray-500 text-sm">Manage product categories and groups</p>
                </div>
                <button
                    onClick={() => { setEditingId('new'); setFormData({}); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50"
                    disabled={editingId !== null}
                >
                    <Plus size={18} /> Add Department
                </button>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {editingId === 'new' && (
                            <tr className="bg-blue-50/50">
                                <td className="px-6 py-4">
                                    <input
                                        autoFocus
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Department Name"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Description"
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={18} /></button>
                                        <button onClick={handleCancel} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {departments.map(dept => (
                            <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                {editingId === dept.id ? (
                                    <>
                                        <td className="px-6 py-4">
                                            <input
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={formData.name || ''}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={formData.description || ''}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={18} /></button>
                                                <button onClick={handleCancel} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X size={18} /></button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 font-medium text-gray-900">{dept.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{dept.description || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-gray-400">
                                                <button onClick={() => handleEdit(dept)} className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(dept.id)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash size={16} /></button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}

                        {!loading && departments.length === 0 && editingId !== 'new' && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                                    No departments found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
