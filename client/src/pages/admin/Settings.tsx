import React, { useState, useEffect } from 'react';
import { Save, Palette, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { API_BASE_URL } from '../../config';

const Settings: React.FC = () => {
  const { accessToken } = useAuth();
  const { updateLocalSettings } = useStore();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    email: '',
    whatsappNumber: '',
    themeColor: '#581C87',
    enableCreditCard: true,
    enablePaypal: true,
    enableCOD: true
  });

  const presetColors = [
    { name: 'Deep Purple', value: '#581C87' },
    { name: 'Green Success', value: '#16A34A' },
    { name: 'Coffee Brown', value: '#6F4E37' },
    { name: 'Sky Blue', value: '#0284C7' },
    { name: 'Amber Orange', value: '#D97706' },
    { name: 'Rose Red', value: '#E11D48' }
  ];

  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentColors');
      return saved ? JSON.parse(saved) : ['#581C87', '#16A34A', '#0284C7'];
    } catch {
      return ['#581C87', '#16A34A', '#0284C7'];
    }
  });

  const updateThemeColor = (color: string) => {
    setFormData(prev => ({ ...prev, themeColor: color }));
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
      const updated = [color, ...filtered].slice(0, 6);
      localStorage.setItem('recentColors', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!accessToken) return;
      try {
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setFormData({
              email: data.settings.email || '',
              whatsappNumber: data.settings.whatsappNumber || '',
              themeColor: data.settings.themeColor || '#581C87',
              enableCreditCard: data.settings.enableCreditCard !== false,
              enablePaypal: data.settings.enablePaypal !== false,
              enableCOD: data.settings.enableCOD !== false
            });
          }
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [accessToken]);

  const handleSave = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        updateLocalSettings(data.settings);
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500">Manage contact information, design configurations, and checkout options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Store Settings & Contacts" icon={Palette}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                      placeholder="support@treeborn.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number (Orders)</label>
                    <input
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                      placeholder="9023374410"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Theme Customization" icon={Palette}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select Preset Theme Accent Color</label>
                  
                  {/* Preset Colors Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
                    {presetColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => updateThemeColor(color.value)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50/50 ${
                          formData.themeColor.toLowerCase() === color.value.toLowerCase()
                            ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/10'
                            : 'border-slate-200'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shadow-inner border border-black/10"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-[10px] font-semibold text-slate-600 truncate max-w-full">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Selector & Selected Color Preview Box */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">Custom Accent Color Selection</label>
                    <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                      {/* Color Palette Selector box */}
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-250/60 shadow-3xs flex items-center justify-center cursor-pointer bg-white">
                        <input
                          type="color"
                          value={formData.themeColor}
                          onChange={(e) => updateThemeColor(e.target.value)}
                          className="absolute inset-0 w-full h-full scale-150 cursor-pointer border-none bg-transparent"
                        />
                      </div>
                      
                      {/* Small Preview Box of selected color */}
                      <div
                        className="w-10 h-10 rounded-lg border border-slate-300 shadow-inner transition-all duration-300"
                        style={{ backgroundColor: formData.themeColor }}
                        title="Selected Accent Preview"
                      />

                      <div className="flex-1 min-w-[120px]">
                        <p className="text-xs font-bold text-slate-800">Selected Hex Color</p>
                        <input
                          type="text"
                          value={formData.themeColor}
                          onChange={(e) => updateThemeColor(e.target.value)}
                          className="mt-1 font-mono text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 w-24 uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recent Colors list display */}
                  {recentColors.length > 0 && (
                    <div className="border-t border-slate-100 pt-5">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Recently Used Accents</p>
                      <div className="flex gap-2">
                        {recentColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => updateThemeColor(color)}
                            className={`w-7 h-7 rounded-lg border hover:scale-105 transition-all cursor-pointer shadow-3xs ${
                              formData.themeColor.toLowerCase() === color.toLowerCase()
                                ? 'border-indigo-600 ring-2 ring-indigo-500/10'
                                : 'border-slate-250/70'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card title="Active Payment Methods" icon={CreditCard}>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3.5 border border-gray-150 rounded-2xl hover:bg-gray-50/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.enableCreditCard}
                    onChange={(e) => setFormData({ ...formData, enableCreditCard: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">Credit Card Payments</span>
                    <span className="text-xs text-gray-500 block mt-0.5">Allow users to pay with major credit cards at checkout.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3.5 border border-gray-150 rounded-2xl hover:bg-gray-50/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.enablePaypal}
                    onChange={(e) => setFormData({ ...formData, enablePaypal: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">PayPal Processing</span>
                    <span className="text-xs text-gray-500 block mt-0.5">Let users complete checkout via secure PayPal redirect gateway.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3.5 border border-gray-150 rounded-2xl hover:bg-gray-50/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.enableCOD}
                    onChange={(e) => setFormData({ ...formData, enableCOD: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">Cash on Delivery (COD)</span>
                    <span className="text-xs text-gray-500 block mt-0.5">Accept order placements with COD processing option.</span>
                  </div>
                </label>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Button icon={Save} onClick={handleSave} className="w-full justify-center py-3.5 text-sm rounded-2xl font-bold shadow-lg shadow-primary/10">
              Save Store Changes
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
