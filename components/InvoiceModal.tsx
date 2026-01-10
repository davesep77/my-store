
import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { Transaction, Item, UserSettings, Customer } from '../types';
import { useReactToPrint } from 'react-to-print';

interface InvoiceModalProps {
    invoiceNumber: string;
    date: string;
    customer?: Customer | null;
    items: { item: Item; quantity: number; price: number }[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    settings: UserSettings;
    onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
    invoiceNumber,
    date,
    customer,
    items,
    subtotal,
    tax,
    total,
    paymentMethod,
    settings,
    onClose
}) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Invoice-${invoiceNumber}`,
        onAfterPrint: onClose
    });

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Invoice Generated</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
                        >
                            <Printer size={18} /> Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-8 bg-white" ref={componentRef}>
                    {/* Invoice Content */}
                    <div className="flex flex-col gap-6 text-slate-800">
                        {/* Header */}
                        <div className="text-center whitespace-pre-line mb-4">
                            <h1 className="text-2xl font-bold uppercase mb-2">INVOICE</h1>
                            <div className="font-bold text-lg">{settings.invoiceHeader || 'MY STORE'}</div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex justify-between text-sm border-b pb-4">
                            <div>
                                <p><span className="font-bold">Date:</span> {date}</p>
                                <p><span className="font-bold">Invoice #:</span> {invoiceNumber}</p>
                                <p><span className="font-bold">Payment:</span> {paymentMethod}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">Bill To:</p>
                                {customer ? (
                                    <>
                                        <p>{customer.firstName} {customer.lastName}</p>
                                        <p>{customer.company}</p>
                                        <p>{customer.phone}</p>
                                    </>
                                ) : (
                                    <p>Cash Customer</p>
                                )}
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-sm">
                            <thead className="border-b-2 border-slate-800">
                                <tr>
                                    <th className="text-left py-2">Item</th>
                                    <th className="text-center py-2">Qty</th>
                                    <th className="text-right py-2">Price</th>
                                    <th className="text-right py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((line, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2">{line.item.name}</td>
                                        <td className="text-center py-2">{line.quantity}</td>
                                        <td className="text-right py-2">{settings.currency} {line.price.toFixed(2)}</td>
                                        <td className="text-right py-2">{settings.currency} {(line.quantity * line.price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end mt-4">
                            <div className="w-48 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{settings.currency} {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax ({settings.taxRate || 0}%):</span>
                                    <span>{settings.currency} {tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-slate-800 pt-2">
                                    <span>Total:</span>
                                    <span>{settings.currency} {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Terms */}
                        <div className="mt-8 pt-4 border-t text-center text-xs text-slate-500 whitespace-pre-line">
                            {settings.invoiceTerms && (
                                <div className="mb-4">
                                    <p className="font-bold mb-1">Terms & Conditions:</p>
                                    {settings.invoiceTerms}
                                </div>
                            )}
                            <div className="font-bold">
                                {settings.invoiceFooter || 'Thank you for your business!'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
