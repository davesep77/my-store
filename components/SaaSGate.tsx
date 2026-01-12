
import React, { useState } from 'react';
import { ShieldAlert, Clock, CreditCard, CheckCircle2, XCircle, LogOut, Star, Check } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface SaaSGateProps {
    user: User;
    onLogout: () => void;
    onStatusUpdate: (user: User) => void;
}

export const SaaSGate: React.FC<SaaSGateProps> = ({ user, onLogout, onStatusUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('pro');

    const plans = [
        { id: 'starter', name: 'Starter', price: 10, features: ['1,000 Items', 'Basic Reports'] },
        { id: 'pro', name: 'Professional', price: 25, features: ['Unlimited Items', 'Advanced Analytics', '5 Users'], popular: true },
        { id: 'enterprise', name: 'Enterprise', price: 50, features: ['All Features', 'Custom Support', 'Unlimited Users'] },
    ];

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Logic: User "pays" -> Move to pending_approval
            await api.submitPayment({
                userId: user.id,
                paymentMethod: 'visa_mock',
                transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
            });

            // Update local user state
            onStatusUpdate({
                ...user,
                payment_status: 'paid',
                account_status: 'pending_approval'
            });
        } catch (err) {
            alert('Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (user.account_status === 'trial' || user.account_status === 'pending_payment') {
        return (
            <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6">
                <div className="max-w-4xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-purple-100 text-[#8E54E9] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-100">
                            <CreditCard size={40} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Activate Your Account</h1>
                        <p className="text-gray-500 max-w-lg mx-auto font-medium">
                            Choose a subscription plan to unlock full access to the inventory ecosystem.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative bg-white p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${selectedPlan === plan.id ? 'border-[#8E54E9] shadow-2xl shadow-purple-100' : 'border-transparent shadow-sm'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8E54E9] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-black text-gray-800 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-black text-gray-900">${plan.price}</span>
                                    <span className="text-gray-400 font-bold text-sm">/mo</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <Check size={14} className="text-green-500" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-colors ${selectedPlan === plan.id ? 'bg-[#8E54E9] border-[#8E54E9]' : 'border-gray-200'
                                    }`}>
                                    {selectedPlan === plan.id && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-6 mt-12">
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="px-12 py-5 bg-[#8E54E9] text-white rounded-2xl font-black text-xl shadow-2xl shadow-purple-200 hover:bg-[#7c47d3] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                        >
                            {loading ? 'Processing...' : `Pay $${plans.find(p => p.id === selectedPlan)?.price} & Continue`}
                        </button>
                        <button onClick={onLogout} className="text-sm font-black text-gray-400 hover:text-red-500 flex items-center gap-2 transition-colors">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (user.account_status === 'pending_approval') {
        return (
            <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-orange-100">
                        <Clock size={48} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Awaiting Approval</h1>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            We've received your payment! Your account is currently under review by our administration team. This usually takes less than 24 hours.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <CheckCircle2 className="text-green-500" size={24} />
                        <div className="text-left">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Payment Status</p>
                            <p className="text-sm font-black text-gray-800 uppercase tracking-tight">Confirmed & Verified</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
                        >
                            Refresh Status
                        </button>
                        <button onClick={onLogout} className="text-sm font-black text-gray-400 hover:text-red-500 flex items-center justify-center gap-2 transition-colors">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (user.account_status === 'rejected') {
        return (
            <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-red-100 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-red-100">
                        <XCircle size={48} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Access Rejected</h1>
                        <p className="text-gray-500 font-medium leading-relaxed font-bold">
                            Unfortunately, your account application has been rejected by the administrator. Please contact support for more information.
                        </p>
                    </div>
                    <button onClick={onLogout} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-100 hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                        <LogOut size={20} /> Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (user.account_status === 'suspended') {
        return (
            <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full space-y-6">
                    <ShieldAlert size={64} className="text-red-500 mx-auto" />
                    <h1 className="text-3xl font-black">Account Suspended</h1>
                    <p className="text-gray-500 font-bold">Your account has been suspended due to a policy violation or payment issue.</p>
                    <button onClick={onLogout} className="px-8 py-3 bg-gray-800 text-white rounded-xl font-bold">Log out</button>
                </div>
            </div>
        );
    }

    return null;
};
