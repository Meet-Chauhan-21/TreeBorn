import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, User, Phone, CalendarDays, Package, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { jsPDF } from 'jspdf';
import { API_BASE_URL } from '../../config';
import Select from '../../components/admin/Select';

const statusOptions = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const OrderView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { accessToken } = useAuth();
  const { settings } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [status, setStatus] = useState('Placed');

  const handleDownloadInvoice = (orderData: any) => {
    try {
      const doc = new jsPDF();
      const primaryColor = settings?.themeColor || '#581C87';
      const hexToRgb = (hex: string) => {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 88, g: 28, b: 135 };
      };
      
      const rgb = hexToRgb(primaryColor);

      const generatePdf = (img?: HTMLImageElement) => {
        if (img) {
          doc.addImage(img, 'JPEG', 14, 12, 12, 12);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.setTextColor(rgb.r, rgb.g, rgb.b);
          doc.text(settings?.shopName || 'TREEBORN', 29, 20);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text('Premium Botanical Skincare', 29, 25);
        } else {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.setTextColor(rgb.r, rgb.g, rgb.b);
          doc.text(settings?.shopName || 'TREEBORN', 14, 20);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text('Premium Botanical Skincare', 14, 25);
        }

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(14, 30, 196, 30);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text('Seller Details:', 14, 38);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);

        // Word wrap seller address dynamically to prevent overlap
        const addressText = `Address: ${settings?.address || 'India'}`;
        const splitAddress = doc.splitTextToSize(addressText, 95);

        doc.text(`Shop: ${settings?.shopName || 'TREEBORN Skincare'}`, 14, 44);
        doc.text(`GST: ${settings?.gstNumber || '24AAAAA0000A1Z5'}`, 14, 49);
        doc.text(`Email: ${settings?.email || 'support@treeborn.com'}`, 14, 54);
        doc.text(splitAddress, 14, 59);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice Details:', 120, 38);
        
        doc.setFont('helvetica', 'normal');
        doc.text([
          `Invoice No: INV-${orderData.orderNumber}`,
          `Order Date: ${orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : 'N/A'}`,
          `Payment Method: ${orderData.payment?.method === 'card' ? 'Online Card' : 'Cash on Delivery (COD)'}`,
          `Payment Status: ${orderData.payment?.status?.toUpperCase() || 'PENDING'}`
        ], 120, 44);
        
        // Compute startY dynamically based on wrapped address length
        const addressLinesCount = splitAddress.length || 1;
        const startY = Math.max(72, 59 + (addressLinesCount * 4.5) + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text('Bill To / Ship To:', 14, startY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const addr = orderData.shippingAddress;
        doc.text([
          `Recipient: ${addr?.name || orderData.user?.name || 'Customer'}`,
          `Phone: ${addr?.phone || 'N/A'}`,
          `Address: ${addr?.street || ''}, ${addr?.district || ''}, ${addr?.state || ''}, ${addr?.country || ''} - ${addr?.zip || ''}`
        ], 14, startY + 6);
        
        let tableY = startY + 28;
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(14, tableY, 182, 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('Product Details', 18, tableY + 5.5);
        doc.text('Size', 110, tableY + 5.5);
        doc.text('Qty', 135, tableY + 5.5);
        doc.text('Price', 155, tableY + 5.5);
        doc.text('Total', 178, tableY + 5.5);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        
        orderData.items.forEach((item: any, index: number) => {
          const itemY = tableY + 8 + (index * 9);
          if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, itemY, 182, 9, 'F');
          }
          
          doc.text(item.name || 'N/A', 18, itemY + 6);
          doc.text(item.selectedSize || '50ml', 110, itemY + 6);
          doc.text(String(item.quantity), 135, itemY + 6);
          doc.text(`INR ${item.price.toFixed(2)}`, 155, itemY + 6);
          doc.text(`INR ${(item.price * item.quantity).toFixed(2)}`, 178, itemY + 6);
        });
        
        const itemsCount = orderData.items.length;
        let summaryY = tableY + 12 + (itemsCount * 9);
        
        doc.setDrawColor(241, 245, 249);
        doc.line(14, summaryY, 196, summaryY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        
        doc.text('Subtotal:', 140, summaryY + 8);
        doc.text(`INR ${orderData.totals.subtotal.toFixed(2)}`, 178, summaryY + 8);
        
        doc.text('Shipping:', 140, summaryY + 14);
        doc.text(`INR ${orderData.totals.shipping.toFixed(2)}`, 178, summaryY + 14);
        
        doc.text('Tax (GST):', 140, summaryY + 20);
        doc.text(`INR ${orderData.totals.tax.toFixed(2)}`, 178, summaryY + 20);
        
        doc.setDrawColor(rgb.r, rgb.g, rgb.b);
        doc.line(135, summaryY + 24, 196, summaryY + 24);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text('Grand Total:', 140, summaryY + 30);
        doc.text(`INR ${orderData.totals.total.toFixed(2)}`, 178, summaryY + 30);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        doc.text('Thank you for choosing Tree Born!', 14, summaryY + 45);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('This is a computer generated invoice and does not require physical signature.', 14, summaryY + 50);
        
        doc.save(`Invoice_${orderData.orderNumber}.pdf`);
        toast.success('Invoice downloaded successfully.');
      };

      if (settings?.logo) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          generatePdf(img);
        };
        img.onerror = () => {
          console.warn('Failed to load store logo, downloading invoice without logo.');
          generatePdf();
        };
        img.src = settings.logo;
      } else {
        generatePdf();
      }
    } catch (pdfError) {
      console.error('Invoice PDF Generation Error:', pdfError);
      toast.error('Failed to generate PDF invoice.');
    }
  };

  useEffect(() => {
    if (!id || !accessToken) return;

    const loadOrder = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
          setStatus(data.order.status);
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, accessToken]);

  const handleStatusSave = async () => {
    if (!id || !accessToken) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        toast.success('Order status updated successfully');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error saving order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order View">
        <div className="flex items-center justify-center min-h-100">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order View">
        <Card>
          <div className="text-center py-10 space-y-4">
            <p className="text-gray-500">Order not found.</p>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/orders')}>
              Back to Orders
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Order View">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button type="button" variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/orders')}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Select
              value={status}
              onChange={setStatus}
              hClass="h-10"
              className="w-48"
              options={statusOptions.map((option) => ({ value: option, label: option }))}
            />
            <Button
              type="button"
              icon={Save}
              onClick={handleStatusSave}
              disabled={saving}
              className="h-10 flex items-center justify-center shrink-0"
            >
              {saving ? 'Saving...' : 'Save Status'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              icon={Download}
              onClick={() => handleDownloadInvoice(order)}
              className="h-10 flex items-center justify-center shrink-0"
            >
              Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" title={`Order ${order.orderNumber}`}>
            <div className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={order.status} />
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  {order.payment?.status || 'pending'} payment
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-3"><User size={16} className="text-primary" /> {order.user?.name || 'N/A'}</div>
                <div className="flex items-center gap-3"><Phone size={16} className="text-primary" /> {order.user?.phone || order.shippingAddress?.phone || 'N/A'}</div>
                <div className="flex items-center gap-3"><CalendarDays size={16} className="text-primary" /> {new Date(order.createdAt).toLocaleString()}</div>
                <div className="flex items-center gap-3"><Package size={16} className="text-primary" /> {order.items?.length || 0} items</div>
              </div>

              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={`${item.productId}-${item.selectedSize}`} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="Shipping Address">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.district}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.country} - {order.shippingAddress?.zip}</p>
              </div>
            </Card>

            <Card title="Totals">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{order.totals?.subtotal?.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Shipping</span><span className="font-semibold">₹{order.totals?.shipping?.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Tax</span><span className="font-semibold">₹{order.totals?.tax?.toFixed(2)}</span></div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-base"><span className="font-bold text-gray-900">Total</span><span className="font-bold text-primary">₹{order.totals?.total?.toFixed(2)}</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderView;
