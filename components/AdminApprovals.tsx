
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCog, Search, Mail, Globe, Star } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

export const AdminApprovals: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
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

    const handleManageUser = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const actions = [];
        if (user.account_status !== 'active') {
            actions.push('approve');
        }
        if (user.account_status !== 'rejected') {
            actions.push('reject');
        }

        const action = window.prompt(`Choose action for ${user.fullName}:\n${actions.join(' / ')}`);
        if (!action) return;

        const statusMap: Record<string, string> = {
            'approve': 'active',
            'reject': 'rejected'
        };

        const newStatus = statusMap[action.toLowerCase()];
        if (!newStatus) {
            alert('Invalid action');
            return;
        }

        try {
            await api.adminUpdateStatus({ userId, status: newStatus });
            fetchUsers();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.fullName.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
    });

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const avatarColors = [
        'bg-purple-100 text-purple-600',
        'bg-blue-100 text-blue-600',
        'bg-pink-100 text-pink-600',
        'bg-indigo-100 text-indigo-600',
    ];

    const getAvatarColor = (userId: string) => {
        const index = userId.charCodeAt(0) % avatarColors.length;
        return avatarColors[index];
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                        <ShieldCheck className="text-gray-700" size={32} />
                        SaaS User Management
                    </h2>
                    <p className="text-gray-500 text-base">Review payments and approve new organization accounts.</p>
                </div>

                <div className="relative min-w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name, email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all text-gray-600"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan & Country</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
                                        <p className="font-medium text-gray-400">Loading users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="text-gray-300" size={32} />
                                        </div>
                                        <p className="font-medium text-gray-400">No users found matching your search.</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(user.id)}`}>
                                                {getInitials(user.fullName)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 mb-1">{user.fullName}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                    <Mail size={13} /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1.5">
                                            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                                <Star size={14} className="text-amber-400" /> {(user.subscription_plan || 'starter').toUpperCase()}
                                            </p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                <Globe size={13} /> {user.country || 'Unknown'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide ${
                                            user.payment_status === 'paid'
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                                        }`}>
                                            {user.payment_status || 'unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide ${
                                            user.account_status === 'active'
                                                ? 'bg-green-50 text-green-700 border border-green-100' :
                                            user.account_status === 'pending_approval'
                                                ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                            user.account_status === 'rejected'
                                                ? 'bg-red-50 text-red-700 border border-red-100' :
                                                'bg-gray-50 text-gray-600 border border-gray-200'
                                        }`}>
                                            {user.account_status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button
                                            onClick={() => handleManageUser(user.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Manage User"
                                        >
                                            <UserCog size={20} />
                                        </button>
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
