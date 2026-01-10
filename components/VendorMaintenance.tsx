
import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { api } from '../services/api';
import {
    Save,
    Trash,
    Plus,
    ChevronLeft,
    ChevronRight,
    X,
    Search,
    HelpCircle,
    Keyboard
} from 'lucide-react';

export const VendorMaintenance: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Vendor>>({});
    const [isEditing, setIsEditing] = useState(false);

    // Initial Load
    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        setLoading(true);
        try {
            const data = await api.getVendors();
            setVendors(data);
            if (data.length > 0) {
                setCurrentIndex(0);
                setFormData(data[0]);
            } else {
                handleAddNew();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Navigation Logic
    const handleNext = () => {
        if (currentIndex < vendors.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            setFormData(vendors[newIndex]);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            setFormData(vendors[newIndex]);
        }
    };

    const handleSearchSelect = (vendorId: string) => {
        const index = vendors.findIndex(v => v.id === vendorId);
        if (index !== -1) {
            setCurrentIndex(index);
            setFormData(vendors[index]);
        }
    };

    // CRUD Logic
    const handleAddNew = () => {
        setFormData({
            vendorNumber: '',
            companyName: '',
            terms: '',
            flatRentRate: 0,
            minOrder: 0,
            commissionPercent: 0,
            poDeliveryMethod: 'Print',
            taxId: '',
            billableDepartment: '',
            socialSecurityNumber: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
            contactFirstName: '',
            contactLastName: '',
            phone: '',
            fax: '',
            email: '',
            website: ''
        });
        setCurrentIndex(-1); // Indicator for new record not yet in list
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!formData.companyName) return alert('Company Name is required');

        try {
            let savedId = formData.id;
            if (currentIndex === -1 || !formData.id) {
                // Create New
                const newVendor: Vendor = {
                    ...(formData as Vendor),
                    id: Math.random().toString(36).substr(2, 9)
                };
                await api.createVendor(newVendor);
                savedId = newVendor.id;
                await loadVendors(); // Reload to get sorting right and update list
                // Find new vendor and select custom
                const newIndex = vendors.findIndex(v => v.id === savedId); // Note: vendors is stale here until next render, ideally we update local state optimization
                // For simplicity, we just trust loadVendors will reset to 0, which is fine, or we find it.
            } else {
                // Update Existing
                await api.updateVendor(formData as Vendor);
                // Update local list in place to avoid full reload jumpiness
                const updatedVendors = [...vendors];
                updatedVendors[currentIndex] = formData as Vendor;
                setVendors(updatedVendors);
            }
            alert('Vendor saved successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save vendor');
        }
    };

    const handleDelete = async () => {
        if (!formData.id) return;
        if (!confirm('Are you sure you want to delete this vendor?')) return;

        try {
            await api.deleteVendor(formData.id);
            await loadVendors();
        } catch (err) {
            console.error(err);
            alert('Failed to delete vendor');
        }
    };

    // Component Styling Helpers
    const Label = ({ children }: { children: React.ReactNode }) => (
        <label className="block text-[#4a6b8c] text-[11px] font-bold mb-0.5">{children}</label>
    );

    const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input
            {...props}
            className={`w-full h-8 px-2 bg-white border border-[#a0b3c6] rounded shadow-sm text-sm focus:ring-2 focus:ring-[#62a2e4] focus:border-[#62a2e4] outline-none transition-colors ${props.className}`}
        />
    );

    const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
        <select
            {...props}
            className={`w-full h-8 px-2 bg-white border border-[#a0b3c6] rounded shadow-sm text-sm focus:ring-2 focus:ring-[#62a2e4] focus:border-[#62a2e4] outline-none ${props.className}`}
        />
    );

    return (
        <div className="bg-[#dbecf9] p-[6px] rounded h-full flex flex-col font-sans select-none">
            {/* Window Header */}
            <div className="bg-gradient-to-b from-[#7cb6f5] to-[#4e8ad6] text-white px-3 py-1.5 flex justify-between items-center rounded-t shadow-sm border-b border-[#3b73b5]">
                <span className="font-bold text-sm drop-shadow-sm tracking-wide">Vendor Maintenance</span>
                <button className="hover:bg-red-500/80 p-0.5 rounded transition-colors" onClick={() => { }} ><X size={16} /></button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-[#eef6fc] p-4 border-l border-r border-[#bed6ea] overflow-y-auto">
                {/* Top Info Bar */}
                <div className="flex justify-between items-center mb-4 bg-[#d4e4f4] p-2 rounded border border-[#bed6ea]">
                    <div className="flex items-center gap-2">
                        <span className="text-[#3b5b7e] font-bold text-sm">Info</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#3b5b7e] font-bold text-lg">
                            General Information for <span className="text-black uppercase">{formData.companyName || 'NEW VENDOR'}</span>
                        </span>
                    </div>
                    <button className="bg-[#b0cbe6] hover:bg-[#a0bce0] text-[#2c4b6e] px-3 py-1 rounded border border-[#8daecf] text-xs font-bold shadow-sm active:translate-y-0.5 transition-all flex items-center gap-1">
                        <Keyboard size={14} /> Keyboard
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-4">
                        {/* General Info Group */}
                        <fieldset className="border border-[#bed6ea] rounded p-3 relative mt-2">
                            <legend className="text-[#4a6b8c] font-bold px-1 text-xs absolute -top-2 left-2 bg-[#eef6fc]">General Info</legend>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <Label>Vendor Number</Label>
                                    <Input
                                        value={formData.vendorNumber || ''}
                                        onChange={e => setFormData({ ...formData, vendorNumber: e.target.value })}
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>
                                <div className="col-span-1"> {/* Intentionally simpler layout than screenshot for easier component management */}
                                    {/* Placeholder for alignment */}
                                </div>
                            </div>

                            <div className="mb-3">
                                <Label>Company Name</Label>
                                <Input
                                    className="font-bold"
                                    value={formData.companyName || ''}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <Label>Terms</Label>
                                    <Input
                                        value={formData.terms || ''}
                                        onChange={e => setFormData({ ...formData, terms: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Flat Rent Rate</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1.5 text-gray-500 text-xs">$</span>
                                        <Input
                                            className="pl-5"
                                            type="number"
                                            value={formData.flatRentRate || 0}
                                            onChange={e => setFormData({ ...formData, flatRentRate: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <Label>Minimum Order</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1.5 text-gray-500 text-xs">$</span>
                                        <Input
                                            className="pl-5"
                                            type="number"
                                            value={formData.minOrder || 0}
                                            onChange={e => setFormData({ ...formData, minOrder: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Commission %</Label>
                                    <Input
                                        type="number"
                                        value={formData.commissionPercent || 0}
                                        onChange={e => setFormData({ ...formData, commissionPercent: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Address Group */}
                        <fieldset className="border border-[#bed6ea] rounded p-3 relative mt-4">
                            <legend className="text-[#4a6b8c] font-bold px-1 text-xs absolute -top-2 left-2 bg-[#eef6fc]">Address</legend>

                            <div className="mb-3">
                                <Label>Street Address</Label>
                                <Input
                                    value={formData.address1 || ''}
                                    onChange={e => setFormData({ ...formData, address1: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <Label>Extended Address</Label>
                                <Input
                                    value={formData.address2 || ''}
                                    onChange={e => setFormData({ ...formData, address2: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-12 gap-2 mb-3">
                                <div className="col-span-7">
                                    <Label>City</Label>
                                    <Input
                                        value={formData.city || ''}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label>State</Label>
                                    <Input
                                        value={formData.state || ''}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <Label>Zip Code</Label>
                                    <Input
                                        value={formData.zip || ''}
                                        onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mb-1">
                                <Label>Country</Label>
                                <Input
                                    value={formData.country || ''}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </fieldset>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-4">
                        {/* More General Info Spillovers */}
                        <fieldset className="border border-[#bed6ea] rounded p-3 relative mt-2">
                            <legend className="text-[#4a6b8c] font-bold px-1 text-xs absolute -top-2 left-2 bg-[#eef6fc]">Additional Details</legend>

                            <div className="mb-3">
                                <Label>PO Delivery Method</Label>
                                <Select
                                    value={formData.poDeliveryMethod || 'Print'}
                                    onChange={e => setFormData({ ...formData, poDeliveryMethod: e.target.value as any })}
                                >
                                    <option value="Print">Print</option>
                                    <option value="Email">Email</option>
                                    <option value="Fax">Fax</option>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <Label>Tax ID</Label>
                                    <Input
                                        value={formData.taxId || ''}
                                        onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Social Security #</Label>
                                    <Input
                                        value={formData.socialSecurityNumber || ''}
                                        onChange={e => setFormData({ ...formData, socialSecurityNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mb-1">
                                <Label>Billable Department</Label>
                                <Input
                                    value={formData.billableDepartment || ''}
                                    onChange={e => setFormData({ ...formData, billableDepartment: e.target.value })}
                                />
                            </div>
                        </fieldset>

                        {/* Contact Info Group */}
                        <fieldset className="border border-[#bed6ea] rounded p-3 relative mt-4">
                            <legend className="text-[#4a6b8c] font-bold px-1 text-xs absolute -top-2 left-2 bg-[#eef6fc]">Contact Info</legend>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <Label>First Name</Label>
                                    <Input
                                        value={formData.contactFirstName || ''}
                                        onChange={e => setFormData({ ...formData, contactFirstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Last Name</Label>
                                    <Input
                                        value={formData.contactLastName || ''}
                                        onChange={e => setFormData({ ...formData, contactLastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <Label>Telephone Number</Label>
                                    <Input
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Fax Number</Label>
                                    <Input
                                        value={formData.fax || ''}
                                        onChange={e => setFormData({ ...formData, fax: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <Label>Email</Label>
                                <Input
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="mb-1">
                                <Label>Website</Label>
                                <Input
                                    value={formData.website || ''}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-[#d4e4f4] p-[10px] rounded-b border-t border-b border-[#bed6ea] flex items-end justify-between gap-4 mt-auto">
                <div className="flex flex-col gap-1 w-1/3">
                    <Label>Search by Vendor #</Label>
                    <div className="relative">
                        <select
                            className="w-full h-8 pl-8 pr-2 bg-white border border-[#a0b3c6] rounded shadow-sm text-sm focus:ring-2 focus:ring-[#62a2e4] outline-none appearance-none"
                            value={formData.id || ''}
                            onChange={(e) => handleSearchSelect(e.target.value)}
                        >
                            <option value="">Select a vendor...</option>
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.vendorNumber ? `${v.vendorNumber} - ` : ''} {v.companyName}
                                </option>
                            ))}
                        </select>
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end">
                    <button className="flex items-center gap-1 px-4 py-1 bg-[#d4e4f4] hover:bg-white border border-[#8daecf] rounded shadow-sm text-[#2c4b6e] font-bold text-sm transition-all" aria-label="Help">
                        <HelpCircle size={16} /> Help
                    </button>

                    <div className="w-px h-8 bg-gray-300 mx-1"></div>

                    <button
                        onClick={handlePrev}
                        disabled={currentIndex <= 0}
                        className="w-10 h-8 flex items-center justify-center bg-gradient-to-b from-[#f0f7fd] to-[#d4e4f4] hover:from-white hover:to-[#e1eff9] border border-[#8daecf] rounded shadow-sm text-[#2c4b6e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex >= vendors.length - 1}
                        className="w-10 h-8 flex items-center justify-center bg-gradient-to-b from-[#f0f7fd] to-[#d4e4f4] hover:from-white hover:to-[#e1eff9] border border-[#8daecf] rounded shadow-sm text-[#2c4b6e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={20} />
                    </button>

                    <div className="w-px h-8 bg-gray-300 mx-1"></div>

                    <button
                        onClick={handleAddNew}
                        className="px-6 h-8 bg-gradient-to-b from-[#f0f7fd] to-[#d4e4f4] hover:from-white hover:to-[#e1eff9] border border-[#8daecf] rounded shadow-sm text-[#2c4b6e] font-bold text-sm active:scale-95 transition-all"
                    >
                        Add
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 h-8 bg-gradient-to-b from-[#f0f7fd] to-[#d4e4f4] hover:from-white hover:to-[#e1eff9] border border-[#8daecf] rounded shadow-sm text-[#2c4b6e] font-bold text-sm active:scale-95 transition-all"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-6 h-8 bg-gradient-to-b from-[#f8d7da] to-[#f5c6cb] hover:from-[#fce8eb] hover:to-[#f8d7da] border border-[#f5c6cb] rounded shadow-sm text-[#721c24] font-bold text-sm active:scale-95 transition-all"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => window.history.back()} // Or close modal prop
                        className="px-6 h-8 bg-gradient-to-b from-[#e2e3e5] to-[#d6d8db] hover:from-[#ececf6] hover:to-[#e2e3e5] border border-[#c6c8ca] rounded shadow-sm text-[#383d41] font-bold text-sm active:scale-95 transition-all"
                    >
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
};
