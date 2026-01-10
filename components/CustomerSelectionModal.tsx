
import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, FileEdit, ArrowUp, ArrowDown, Check, X, User } from 'lucide-react';
import { Customer } from '../types';
import { api } from '../services/api';
import { CustomerFormModal } from './CustomerFormModal';

interface CustomerSelectionModalProps {
    onSelect: (customer: Customer) => void;
    onClose: () => void;
}

export const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({ onSelect, onClose }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
    const tableRef = useRef<HTMLDivElement>(null);

    const fetchCustomers = () => {
        api.getCustomers().then(data => {
            setCustomers(data);
            // Maintain selection if possible, otherwise reset
            setSelectedIndex(-1);
        }).catch(console.error);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        (c.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.customerNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.phone?.includes(searchTerm)) ||
        (c.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleKeyboardInput = (key: string) => {
        if (key === 'BACKSPACE') {
            setSearchTerm(prev => prev.slice(0, -1));
        } else if (key === 'SPACE') {
            setSearchTerm(prev => prev + ' ');
        } else if (key === 'CLEAR') {
            setSearchTerm('');
        } else {
            setSearchTerm(prev => prev + key);
        }
    };

    const handleSelect = () => {
        if (selectedIndex >= 0 && selectedIndex < filteredCustomers.length) {
            onSelect(filteredCustomers[selectedIndex]);
            onClose();
        }
    };

    const handleAddClick = () => {
        setEditingCustomer(undefined);
        setShowFormModal(true);
    };

    const handleEditClick = () => {
        if (selectedIndex >= 0 && selectedIndex < filteredCustomers.length) {
            setEditingCustomer(filteredCustomers[selectedIndex]);
            setShowFormModal(true);
        }
    };

    const handleFormSave = () => {
        fetchCustomers(); // Refresh list
    };

    const handleScrollUp = () => {
        setSelectedIndex(prev => Math.max(0, prev - 1));
        // Simple scroll into view logic could be added here
    };

    const handleScrollDown = () => {
        setSelectedIndex(prev => Math.min(filteredCustomers.length - 1, prev + 1));
    };

    const keys = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#8ecae6] w-full max-w-4xl rounded-lg shadow-2xl border-4 border-[#219ebc] flex flex-col overflow-hidden max-h-[90vh]">

                {/* Header / Title Bar */}
                <div className="bg-gradient-to-r from-[#219ebc] to-[#023047] text-white px-4 py-2 flex justify-between items-center shadow-md">
                    <span className="font-bold text-lg tracking-wide drop-shadow-md">Select Customer</span>
                    <button onClick={onClose} className="hover:bg-red-500 p-1 rounded transition-colors"><X size={20} /></button>
                </div>

                {/* Grid */}
                <div className="bg-[#023047] p-2 flex-grow overflow-hidden h-64 border-b border-[#219ebc]">
                    <div className="bg-white h-full overflow-y-auto w-full" ref={tableRef}>
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-[#8ecae6] text-[#023047] sticky top-0 font-bold z-10">
                                <tr>
                                    <th className="p-2 border-r border-[#219ebc]">Customer#</th>
                                    <th className="p-2 border-r border-[#219ebc]">First Name</th>
                                    <th className="p-2 border-r border-[#219ebc]">Last Name</th>
                                    <th className="p-2 border-r border-[#219ebc]">Address</th>
                                    <th className="p-2 border-r border-[#219ebc]">Company</th>
                                    <th className="p-2 border-r border-[#219ebc]">Phone #</th>
                                    <th className="p-2">Zip Code</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCustomers.map((c, idx) => (
                                    <tr
                                        key={c.id}
                                        onClick={() => setSelectedIndex(idx)}
                                        className={`cursor-pointer ${selectedIndex === idx ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-800'}`}
                                    >
                                        <td className="p-2 border-r border-gray-200">{c.customerNumber || c.id.substring(0, 8)}</td>
                                        <td className="p-2 border-r border-gray-200">{c.firstName}</td>
                                        <td className="p-2 border-r border-gray-200">{c.lastName}</td>
                                        <td className="p-2 border-r border-gray-200 truncate max-w-[150px]">{c.address}</td>
                                        <td className="p-2 border-r border-gray-200">{c.company}</td>
                                        <td className="p-2 border-r border-gray-200">{c.phone}</td>
                                        <td className="p-2">{c.zipCode}</td>
                                    </tr>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <tr><td colSpan={7} className="p-4 text-center text-gray-500">No customers found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Controls Area */}
                <div className="bg-[#caf0f8] p-4 flex gap-4">
                    {/* Keyboard Section */}
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex gap-2 mb-2">
                            <div className="flex-1 bg-white border border-[#219ebc] rounded p-1 flex items-center">
                                <span className="text-[10px] text-gray-500 mr-2 font-bold uppercase">Search:</span>
                                <input
                                    className="flex-1 outline-none text-sm font-bold uppercase text-[#023047]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="TYPE COSTOMER#,NAME,COMPANY,PHONE..."
                                    autoFocus
                                />
                            </div>
                            <button onClick={() => handleKeyboardInput('BACKSPACE')} className="px-3 py-1 bg-[#ade8f4] border border-[#48cae4] rounded text-xs font-bold shadow-sm active:translate-y-0.5">Back Space</button>
                        </div>

                        <div className="flex flex-col gap-1.5 select-none">
                            {keys.map((row, i) => (
                                <div key={i} className="flex justify-center gap-1.5">
                                    {row.map(char => (
                                        <button
                                            key={char}
                                            onClick={() => handleKeyboardInput(char)}
                                            className="w-10 h-10 bg-gradient-to-b from-[#fff] to-[#e0f7fa] border border-[#b2ebf2] rounded shadow-md text-[#0077b6] font-bold text-lg hover:bg-[#b2ebf2] active:bg-[#4dd0e1] active:text-white transition-all transform active:scale-95"
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            ))}
                            <div className="flex justify-center gap-1.5 mt-1">
                                <button onClick={() => handleKeyboardInput('SPACE')} className="w-64 h-10 bg-gradient-to-b from-[#fff] to-[#e0f7fa] border border-[#b2ebf2] rounded shadow-md text-[#0077b6] font-bold text-sm hover:bg-[#b2ebf2] active:bg-[#4dd0e1] active:text-white">Space</button>
                                <button onClick={() => handleKeyboardInput('CLEAR')} className="w-20 h-10 bg-gradient-to-b from-[#ffcccc] to-[#ffa3a3] border border-[#ff9999] rounded shadow-md text-[#cc0000] font-bold text-xs hover:bg-[#ffcccc] active:bg-[#ff6666]">Clear</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Button Panel */}
                    <div className="w-40 flex flex-col gap-2">
                        <div className="flex gap-1">
                            <button
                                onClick={handleAddClick}
                                className="flex-1 h-14 bg-gradient-to-b from-[#a4f4f9] to-[#48cae4] border border-[#0096c7] rounded shadow-md flex flex-col items-center justify-center text-[#023fb5] font-bold text-[10px] active:scale-95"
                            >
                                <UserPlus size={16} className="mb-1" />
                                Add<br />Customer
                            </button>
                            <button
                                onClick={handleEditClick}
                                className="flex-1 h-14 bg-gradient-to-b from-[#a4f4f9] to-[#48cae4] border border-[#0096c7] rounded shadow-md flex flex-col items-center justify-center text-[#023fb5] font-bold text-[10px] active:scale-95"
                            >
                                <FileEdit size={16} className="mb-1" />
                                Edit<br />Customer
                            </button>
                        </div>

                        <div className="flex gap-1">
                            <button onClick={handleScrollUp} className="flex-1 h-12 bg-[#e0f7fa] border border-[#b2ebf2] rounded shadow-sm flex items-center justify-center text-[#0077b6] active:bg-[#b2ebf2]">
                                <ArrowUp size={20} />
                            </button>
                            <button onClick={handleScrollDown} className="flex-1 h-12 bg-[#e0f7fa] border border-[#b2ebf2] rounded shadow-sm flex items-center justify-center text-[#0077b6] active:bg-[#b2ebf2]">
                                <ArrowDown size={20} />
                            </button>
                        </div>

                        <button className="h-12 bg-gradient-to-b from-[#90e0ef] to-[#00b4d8] border border-[#0077b6] rounded shadow-md flex items-center justify-center gap-2 text-white font-bold active:scale-95">
                            <Search size={18} /> Search
                        </button>

                        <div className="mt-auto flex flex-col gap-2">
                            <button onClick={onClose} className="h-12 bg-gradient-to-b from-[#e5e5e5] to-[#cccccc] border border-[#999999] rounded shadow-md text-[#333] font-bold text-lg active:scale-95">
                                Exit
                            </button>
                            <button onClick={handleSelect} disabled={selectedIndex === -1} className="h-12 bg-gradient-to-b from-[#b9fbc0] to-[#34a0a4] border border-[#168aad] rounded shadow-md text-[#023047] font-bold text-lg active:scale-95 disabled:opacity-50">
                                Select
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nested Form Modal */}
            {showFormModal && (
                <CustomerFormModal
                    customer={editingCustomer}
                    onSave={handleFormSave}
                    onClose={() => setShowFormModal(false)}
                />
            )}
        </div>
    );
};
