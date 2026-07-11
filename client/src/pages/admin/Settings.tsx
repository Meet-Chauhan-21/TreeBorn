import React from 'react';
import { Save, Bell, Shield, Palette, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';

const Settings: React.FC = () => {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500">Manage your store settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Store Information" icon={Palette}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                  <input
                    type="text"
                    defaultValue="TreeBorn"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Store Description</label>
                  <textarea
                    defaultValue="Premium organic skincare products"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="dabhisanjay901@gmail.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+91 8905330954"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Payment Settings" icon={CreditCard}>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
                  <span className="text-sm font-medium text-gray-700">Enable Credit Card Payments</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
                  <span className="text-sm font-medium text-gray-700">Enable PayPal</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
                  <span className="text-sm font-medium text-gray-700">Enable Cash on Delivery</span>
                </label>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Notifications" icon={Bell}>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
                  <span className="text-sm font-medium text-gray-700">New Order Alerts</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
                  <span className="text-sm font-medium text-gray-700">Low Stock Alerts</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary" />
                  <span className="text-sm font-medium text-gray-700">Daily Sales Report</span>
                </label>
              </div>
            </Card>

            <Card title="Security" icon={Shield}>
              <div className="space-y-4">
                <Button variant="secondary" className="w-full justify-center">
                  Change Password
                </Button>
                <Button variant="secondary" className="w-full justify-center">
                  Two-Factor Auth
                </Button>
              </div>
            </Card>

            <Button icon={Save} onClick={handleSave} className="w-full justify-center">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
