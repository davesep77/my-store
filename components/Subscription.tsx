import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Shield, Globe, Zap, Star, Trash2 } from 'lucide-react';
import { UserSettings, PaymentMethod } from '../types';
import { api } from '../services/api';

interface SubscriptionProps {
    settings: UserSettings;
    onUpdate: (s: UserSettings) => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ settings, onUpdate }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(settings.billingCycle || 'monthly');
    const [selectedPlan, setSelectedPlan] = useState<string>(settings.subscriptionPlan || 'starter');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            const methods = await api.getPaymentMethods();
            setPaymentMethods(methods);
        } catch (e) {
            console.error("Failed to load payment methods", e);
        }
    };

    const plans = [
        {
            id: 'starter',
            name: 'Starter Global',
            price: billingCycle === 'monthly' ? 10 : 100,
            currency: 'USD',
            features: ['Up to 1,000 Items', 'Basic Reporting', '1 User Account', 'Email Support'],
            recommended: false
        },
        {
            id: 'pro',
            name: 'Professional',
            price: billingCycle === 'monthly' ? 15 : 150,
            currency: 'USD',
            features: ['Unlimited Items', 'Advanced Analytics', '5 User Accounts', 'Priority 24/7 Support', 'Multi-currency Support', 'API Access'],
            recommended: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: billingCycle === 'monthly' ? 30 : 300,
            currency: 'USD',
            features: ['Unlimited Everything', 'Dedicated Account Manager', 'Custom Integrations', 'SLA Guarantee', 'On-premise Deployment'],
            recommended: false
        }
    ];

    const handleSubscribe = async (planId: string) => {
        if (planId === settings.subscriptionPlan && billingCycle === settings.billingCycle) return;

        setIsProcessing(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        onUpdate({
            ...settings,
            subscriptionPlan: planId as any,
            billingCycle: billingCycle,
            subscriptionStatus: 'active'
        });

        setIsProcessing(false);
        alert(`Successfully subscribed to ${plans.find(p => p.id === planId)?.name}!`);
    };

    const handleAddPaymentMethod = async () => {
        setIsProcessing(true);
        try {
            // Mock data for now, in reality you'd get a token from Stripe
            const newMethod: PaymentMethod = {
                id: crypto.randomUUID(),
                type: 'card',
                provider: 'stripe',
                last4: Math.floor(1000 + Math.random() * 9000).toString(),
                expiry_month: 12,
                expiry_year: 2028,
                brand: 'visa',
                is_default: paymentMethods.length === 0
            };
            await api.addPaymentMethod(newMethod);
            await loadPaymentMethods();
            setShowPaymentModal(false);
        } catch (e) {
            alert('Failed to add payment method');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeletePaymentMethod = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Remove this payment method?')) return;
        try {
            await api.deletePaymentMethod(id);
            await loadPaymentMethods();
        } catch (err) {
            alert('Failed to remove payment method');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {isProcessing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
                    <div className="w-12 h-12 border-4 border-[#8E54E9] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-gray-800">Processing...</p>
                </div>
            )}

            <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-gray-800">Choose Your Global Plan</h2>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Scale your inventory management with our international-ready subscription tiers.
                    Secure payments powered by Stripe & PayPal.
                </p>

                <div className="flex items-center justify-center mt-6 gap-4">
                    <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-gray-800' : 'text-gray-400'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${billingCycle === 'yearly' ? 'bg-[#8E54E9]' : 'bg-gray-200'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-gray-800' : 'text-gray-400'}`}>
                        Yearly <span className="text-[#8E54E9] text-xs">(Save 20%)</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isCurrent = settings.subscriptionPlan === plan.id && settings.billingCycle === billingCycle;
                    const isSelected = selectedPlan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected
                                    ? 'border-[#8E54E9] bg-white shadow-xl shadow-purple-100'
                                    : 'border-transparent bg-white shadow-sm hover:shadow-md'
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8E54E9] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Star size={12} fill="currentColor" />
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900">${plan.price}</span>
                                    <span className="text-gray-400 font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                                        <div className="mt-0.5 min-w-[18px] h-[18px] bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubscribe(plan.id);
                                }}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${isCurrent
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : (isSelected ? 'bg-[#8E54E9] text-white shadow-lg shadow-purple-200 hover:bg-[#7c47d3]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')
                                    }`}>
                                {isCurrent ? 'Current Plan' : (isSelected ? 'Subscribe Now' : 'Choose Plan')}
                            </button>
                        </div>
                    )
                })}
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard className="text-[#8E54E9]" />
                    Payment Methods
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paymentMethods.map(method => (
                        <div key={method.id} className={`p-6 border rounded-2xl flex items-center justify-between group transition-colors cursor-pointer ${method.is_default ? 'border-[#8E54E9] bg-purple-50/20' : 'border-gray-200 bg-gray-50/50 hover:border-purple-200'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs uppercase">{method.brand || 'CARD'}</div>
                                <div>
                                    <p className="font-bold text-gray-800">Visa ending in {method.last4}</p>
                                    <p className="text-xs text-gray-400">Expires {method.expiry_month}/{method.expiry_year}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {method.is_default && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Default</span>}
                                <button onClick={(e) => handleDeletePaymentMethod(method.id, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div
                        onClick={() => setShowPaymentModal(true)}
                        className="p-6 border border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-[#8E54E9] hover:border-[#8E54E9] hover:bg-purple-50 transition-all cursor-pointer h-full min-h-[80px]"
                    >
                        <Zap size={20} />
                        <span className="font-bold">Add New Payment Method</span>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-green-500" />
                        <span>Payments are SSL encrypted and secured by Stripe.</span>
                    </div>
                    <div className="flex gap-4">
                        <Globe size={16} />
                        <span>International payments accepted in 135+ currencies.</span>
                    </div>
                </div>
            </div>

            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Payment Method</h3>
                        <p className="text-gray-500 mb-6">Enter your card details securely. (Mock)</p>

                        <div className="space-y-4">
                            <input type="text" placeholder="Card Number" className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#8E54E9]" />
                            <div className="flex gap-4">
                                <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#8E54E9]" />
                                <input type="text" placeholder="CVC" className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#8E54E9]" />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPaymentMethod}
                                className="flex-1 py-3 bg-[#8E54E9] text-white font-bold rounded-xl shadow-lg shadow-purple-200"
                            >
                                Save Card
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
