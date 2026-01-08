
import React, { useState } from 'react';
import { Save, Globe, Mail, Coins, Calendar } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (s: UserSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
          <Globe className="mr-3 text-[#8E54E9]" />
          User Preferences
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Coins size={16} className="mr-2 text-gray-400" />
                Currency (ISO Code)
              </label>
              <input 
                type="text" 
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#8E54E9]"
                placeholder="e.g. USD, GBP, EUR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Globe size={16} className="mr-2 text-gray-400" />
                Locale
              </label>
              <input 
                type="text" 
                value={formData.locale}
                onChange={(e) => setFormData({...formData, locale: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#8E54E9]"
                placeholder="e.g. en-US, en-GB"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar size={16} className="mr-2 text-gray-400" />
              Date Format
            </label>
            <select 
              value={formData.dateFormat}
              onChange={(e) => setFormData({...formData, dateFormat: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#8E54E9]"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Mail size={16} className="mr-2 text-gray-400" />
              Notification Email
            </label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#8E54E9]"
              placeholder="admin@example.com"
            />
            <p className="mt-2 text-xs text-gray-400 italic">System notifications will be sent to this address on new transactions.</p>
          </div>

          <div className="pt-6 border-t flex items-center justify-between">
            <div className={`text-sm font-semibold text-green-500 transition-opacity duration-300 ${saved ? 'opacity-100' : 'opacity-0'}`}>
              Settings saved successfully!
            </div>
            <button className="flex items-center bg-[#8E54E9] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7c47d3] transition-all shadow-lg shadow-purple-200">
              <Save size={18} className="mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
