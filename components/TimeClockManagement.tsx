
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Search, Trash2, Edit2, Play, Square, Pause } from 'lucide-react';
import { TimeEntry, Employee } from '../types';
import { api } from '../services/api';

export const TimeClockManagement: React.FC = () => {
    const [entries, setEntries] = useState<(TimeEntry & { firstName?: string, lastName?: string })[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [pinCode, setPinCode] = useState('');
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const emps = await api.getEmployees();
            setEmployees(emps);
            const times = await api.getTimeEntries();
            // Join manually if API didn't return names (it does though) - API returns t.*, firstName, lastName
            // Typescript won't know that unless I cast or update interface. I'll cast for now.
            setEntries(times as any);
        } catch (e) {
            console.error(e);
        }
    };

    const handleClockAction = async (action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end') => {
        if (!selectedEmployeeId) {
            setStatus('Please select an employee.');
            return;
        }

        // Verify PIN
        const emp = employees.find(e => e.id === selectedEmployeeId);
        if (emp?.pinCode && emp.pinCode !== pinCode) {
            setStatus('Invalid PIN code.');
            return;
        }

        try {
            await api.addTimeEntry(selectedEmployeeId, action);
            setStatus(`Success: ${action.replace('_', ' ').toUpperCase()}`);
            setPinCode('');
            loadData();
            setTimeout(() => setStatus(''), 3000);
        } catch (e) {
            setStatus('Error recording time.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this log entry?")) return;
        try {
            await api.deleteTimeEntry(id);
            loadData();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Time Clock Management</h1>
                    <p className="text-slate-500 font-medium">Track attendance and shift hours.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Clock In/Out Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center space-y-6">
                    <div className="bg-blue-50 p-6 rounded-full text-blue-600 mb-4">
                        <Clock size={48} />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800">Time Clock Terminal</h2>

                    <div className="w-full max-w-sm space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Select Employee</label>
                            <select
                                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                                value={selectedEmployeeId}
                                onChange={e => setSelectedEmployeeId(e.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {employees.filter(e => e.isActive).map(e => (
                                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Enter PIN</label>
                            <input
                                type="password"
                                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-center font-bold text-xl tracking-widest"
                                value={pinCode}
                                onChange={e => setPinCode(e.target.value)}
                                placeholder="****"
                            />
                        </div>

                        {status && <div className={`text-center font-bold p-2 rounded ${status.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status}</div>}

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <button onClick={() => handleClockAction('clock_in')} className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-1 active:scale-95 transition-all">
                                <Play size={24} /> Clock In
                            </button>
                            <button onClick={() => handleClockAction('clock_out')} className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-1 active:scale-95 transition-all">
                                <Square size={24} /> Clock Out
                            </button>
                            <button onClick={() => handleClockAction('break_start')} className="bg-orange-400 hover:bg-orange-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                                <Pause size={18} /> Start Break
                            </button>
                            <button onClick={() => handleClockAction('break_end')} className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                                <Play size={18} /> End Break
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logs Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><CheckCircle size={18} className="text-slate-400" /> Recent Activity</h3>
                        <button onClick={loadData} className="text-blue-600 text-sm font-bold hover:underline">Refresh</button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase sticky top-0">
                                <tr>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4 text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-mono text-sm text-slate-600">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">
                                            {entry.firstName} {entry.lastName}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${entry.action === 'clock_in' ? 'bg-green-100 text-green-700' :
                                                    entry.action === 'clock_out' ? 'bg-red-100 text-red-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {entry.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDelete(entry.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {entries.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">No activity logged.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
