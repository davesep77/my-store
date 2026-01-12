
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, UserX, Search, Mail, Globe, Calendar, CreditCard, Star } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

export const AdminApprovals: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (userId: string, status: string) => {
        if (!confirm(`Are you sure you want to ${status} this user?`)) return;
        try {
            await api.adminUpdateStatus({ userId, status });
            fetchUsers();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <ShieldCheck className="text-[#8E54E9]" />
                        SaaS User Management
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">Review payments and approve new organization accounts.</p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name, email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8E54E9]/20 outline-none font-medium transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan & Country</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-[#8E54E9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="font-bold text-gray-400">Loading users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="text-gray-300" size={32} />
                                        </div>
                                        <p className="font-bold text-gray-400">No users found matching your search.</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 text-[#8E54E9] rounded-xl flex items-center justify-center font-black text-xs">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 leading-none mb-1">{user.fullName}</p>
                                                <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <Mail size={12} /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-gray-700 uppercase flex items-center gap-1">
                                                <Star size={12} className="text-orange-400" /> {user.subscription_plan || 'Starter'}
                                            </p>
                                            <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                <Globe size={12} /> {user.country || 'Unknown'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <CreditCard size={10} className="inline mr-1 mb-0.5" />
                                            {user.payment_status || 'unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.account_status === 'active' ? 'bg-green-100 text-green-600' :
                                            user.account_status === 'pending_approval' ? 'bg-orange-100 text-orange-600' :
                                                user.account_status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {user.account_status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            {user.account_status !== 'active' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.id, 'active')}
                                                    className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Approve User"
                                                >
                                                    <UserCheck size={18} />
                                                </button>
                                            )}
                                            {user.account_status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.id, 'rejected')}
                                                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Reject User"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
