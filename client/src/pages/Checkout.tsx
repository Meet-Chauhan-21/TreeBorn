import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle, ShoppingBag, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { SearchableDropdown } from '../components/layout/SearchableDropdown';
import { locationData } from '../data/locationData';
import { toast } from 'sonner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Button from '../components/layout/Button';

const formatWhatsAppMessage = (
  orderNumber: string,
  shippingAddress: any,
  cartItems: any[],
  totalAmount: number,
  paymentMethod: string
) => {
  let message = `🌿 *NEW ORDER FROM TREEBORN* 🌿\n\n`;
  message += `*Order Number:* ${orderNumber}\n`;
  message += `*Customer:* ${shippingAddress.name}\n`;
  message += `*Phone:* ${shippingAddress.phone}\n`;
  message += `*Payment Method:* ${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Card'}\n\n`;
  
  message += `📦 *Products Ordered:*\n`;
  cartItems.forEach((item, index) => {
    message += `${index + 1}. *${item.product.name}* (Size: ${item.selectedSize}) - Qty: ${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}\n`;
  });
  
  message += `\n💵 *Total Amount Paid:* $${totalAmount.toFixed(2)}\n\n`;
  message += `📍 *Shipping Address:*\n`;
  message += `${shippingAddress.street},\n`;
  message += `${shippingAddress.district}, ${shippingAddress.state},\n`;
  message += `${shippingAddress.country} - ${shippingAddress.zip}\n\n`;
  message += `Thank you for shopping! 🌱`;
  
  return encodeURIComponent(message);
};

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useStore();
  const { user, placeOrder, loading } = useAuth();

  // Load user saved addresses
  const savedAddresses = user?.addresses || [];
  const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];

  const [useNewAddress, setUseNewAddress] = useState<boolean>(savedAddresses.length === 0);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?._id || '');

  // Redirect if cart is empty
  React.useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      toast.error('Your cart is empty. Please add products to check out.');
      navigate('/');
    }
  }, [cart, navigate]);

  // Shipping Form State (Fallback / Guest)
  const [newAddressForm, setNewAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    country: 'India',
    state: '',
    district: '',
    zip: ''
  });

  // Card Payment Form State
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: user?.name || '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [whatsappOrderUrl, setWhatsappOrderUrl] = useState('');

  // Orders are created server-side and require auth
  React.useEffect(() => {
    if (loading) return;
    if (!user && !orderPlaced) {
      toast.error('Please sign in to place an order.');
      navigate('/login');
    }
  }, [user, loading, navigate, orderPlaced]);

  // Cart values
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% sales tax
  const total = subtotal + shipping + tax;

  // Cascading Address Dropdowns for new addresses
  const countryOptions = locationData.map((c) => c.name);
  const selectedCountryObj = locationData.find((c) => c.name === newAddressForm.country);
  const stateOptions = selectedCountryObj ? selectedCountryObj.states.map((s) => s.name) : [];
  const selectedStateObj = selectedCountryObj?.states.find((s) => s.name === newAddressForm.state);
  const districtOptions = selectedStateObj ? selectedStateObj.districts : [];

  const handleCountryChange = (val: string) => {
    setNewAddressForm({
      ...newAddressForm,
      country: val,
      state: '',
      district: ''
    });
  };

  const handleStateChange = (val: string) => {
    setNewAddressForm({
      ...newAddressForm,
      state: val,
      district: ''
    });
  };

  const handleDistrictChange = (val: string) => {
    setNewAddressForm({
      ...newAddressForm,
      district: val
    });
  };

  // Handle inputs
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setPaymentInfo({ ...paymentInfo, expiry: value });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPaymentInfo({ ...paymentInfo, cvv: value.slice(0, 3) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Address Validation
    if (useNewAddress) {
      const { name, phone, street, country, state, district, zip } = newAddressForm;
      if (!name || !phone || !street || !country || !state || !district || !zip) {
        toast.error('Please complete all required shipping fields.');
        return;
      }
    } else {
      if (!selectedAddressId) {
        toast.error('Please select a saved shipping address.');
        return;
      }
    }

    // Payment Validation
    if (paymentMethod === 'card') {
      if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit credit card number.');
        return;
      }

      if (paymentInfo.expiry.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY).');
        return;
      }

      if (paymentInfo.cvv.length !== 3) {
        toast.error('Please enter a valid CVV.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const selectedSavedAddress =
        !useNewAddress ? savedAddresses.find((a) => a._id === selectedAddressId) : undefined;

      if (!useNewAddress && !selectedSavedAddress) {
        toast.error('Please select a valid saved shipping address.');
        setIsSubmitting(false);
        return;
      }

      const shippingAddress = useNewAddress
        ? {
            name: newAddressForm.name,
            phone: newAddressForm.phone,
            street: newAddressForm.street,
            country: newAddressForm.country,
            state: newAddressForm.state,
            district: newAddressForm.district,
            zip: newAddressForm.zip
          }
        : {
            name: selectedSavedAddress!.name,
            phone: selectedSavedAddress!.phone,
            street: selectedSavedAddress!.street,
            country: selectedSavedAddress!.country,
            state: selectedSavedAddress!.state,
            district: selectedSavedAddress!.district,
            zip: selectedSavedAddress!.zip
          };

      const cardDigitsOnly = paymentInfo.cardNumber.replace(/\s/g, '');
      const cardLast4 = cardDigitsOnly.slice(-4);

      const result = await placeOrder({
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          selectedSize: item.selectedSize
        })),
        shippingAddress,
        paymentMethod,
        paymentDetails:
          paymentMethod === 'card'
            ? { cardName: paymentInfo.cardName, cardLast4 }
            : undefined,
        totals: { subtotal, shipping, tax, total }
      });

      setIsSubmitting(false);

      if (!result) return;

      setOrderId(result.order.orderNumber);

      const orderMsg = formatWhatsAppMessage(
        result.order.orderNumber,
        shippingAddress,
        cart,
        total,
        paymentMethod
      );
      const url = `https://wa.me/918905330954?text=${orderMsg}`;
      setWhatsappOrderUrl(url);

      setOrderPlaced(true);

      if (paymentMethod === 'card') {
        toast.success('Payment authorized. Order confirmed!');
      } else {
        toast.success('Order placed successfully (Cash on Delivery)!');
      }

      // Auto open WhatsApp tab
      try {
        window.open(url, '_blank');
      } catch (e) {
        console.error('Popup blocked by browser:', e);
      }
    } catch (err) {
      console.error('Checkout order error:', err);
      toast.error('Failed to place order.');
      setIsSubmitting(false);
    }
  };

  const handleCompleteOrderSuccess = () => {
    clearCart();
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Checkout — TREEBORN Premium Skincare</title>
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-20 bg-light-gray/30 min-h-screen">
        <Container>
          
          <Link
            to="/"
            onClick={(e) => {
              if (cart.length > 0) {
                e.preventDefault();
                navigate(-1);
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-display font-semibold text-gray-500 hover:text-primary mb-6 transition-colors uppercase tracking-wider focus:outline-none"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-dark tracking-tight mb-8">
            Botanical Secure Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Shipping & Payment Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Shipping Address */}
              <div className="bg-white border border-border-gray/30 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-border-gray/40 pb-4 justify-between flex-wrap">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-primary" />
                    <h2 className="text-base font-display font-semibold text-dark">Shipping Logistics Address</h2>
                  </div>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(!useNewAddress)}
                      className="text-xs font-semibold font-display text-primary hover:text-primary-light transition-colors cursor-pointer"
                    >
                      {useNewAddress ? 'Use Saved Address' : 'Enter New Address'}
                    </button>
                  )}
                </div>

                {savedAddresses.length > 0 && !useNewAddress ? (
                  /* Saved Addresses selector */
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-dark/70 font-display block">
                      Select one of your registered shipping addresses
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id || '')}
                            className={`border rounded-2xl p-4 cursor-pointer flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/2 shadow-xs'
                                : 'border-border-gray/50 bg-white hover:border-primary/20'
                            }`}
                          >
                            <div className="space-y-2 font-sans text-xs text-left">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`inline-block border px-2 py-0.5 rounded-md font-display font-bold uppercase tracking-wider text-[8px] ${
                                  addr.isDefault
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : 'bg-gray-50 text-gray-500 border-border-gray/30'
                                }`}>
                                  {addr.isDefault ? 'Primary' : 'Shipping'}
                                </span>
                                {isSelected && (
                                  <span className="w-2.5 h-2.5 bg-primary rounded-full flex items-center justify-center border border-white" />
                                )}
                              </div>
                              <h4 className="font-semibold text-dark text-xs">{addr.name}</h4>
                              <div className="text-gray-500 space-y-0.5 leading-relaxed font-medium">
                                <p>{addr.street}</p>
                                <p>{addr.district}, {addr.state}</p>
                                <p>{addr.country} - {addr.zip}</p>
                                <p className="mt-1.5 block text-dark/70 font-semibold">Phone: {addr.phone}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Enter New Address details Form */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-dark/70 font-display">Recipient Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Meet Chauhan"
                          value={newAddressForm.name}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/10"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-dark/70 font-display">Street Address *</label>
                        <input
                          type="text"
                          required
                          placeholder="404 Luxury Tower, SG Road"
                          value={newAddressForm.street}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/10"
                        />
                      </div>

                      {/* Cascaded Country -> State -> District dropdowns */}
                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SearchableDropdown
                          label="Country"
                          required
                          options={countryOptions}
                          value={newAddressForm.country}
                          onChange={handleCountryChange}
                        />

                        <SearchableDropdown
                          label="State"
                          required
                          options={stateOptions}
                          value={newAddressForm.state}
                          onChange={handleStateChange}
                          placeholder={newAddressForm.country ? "Select State" : "Choose Country first"}
                          disabled={!newAddressForm.country}
                        />

                        <SearchableDropdown
                          label="District"
                          required
                          options={districtOptions}
                          value={newAddressForm.district}
                          onChange={handleDistrictChange}
                          placeholder={newAddressForm.state ? "Select District" : "Choose State first"}
                          disabled={!newAddressForm.state}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display">ZIP / Postal Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="380054"
                          value={newAddressForm.zip}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, zip: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display">Mobile Phone Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="+91 98765 43210"
                          value={newAddressForm.phone}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/10"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Payment Details */}
              <div className="bg-white border border-border-gray/30 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-2 border-b border-border-gray/40 pb-4">
                  <CreditCard size={18} className="text-primary" />
                  <h2 className="text-base font-display font-semibold text-dark">Payment Methodology Selection</h2>
                </div>

                {/* Tabs selector */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-light-gray/60 border border-border-gray/40 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 rounded-xl text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-dark/70 hover:bg-gray-100 hover:text-dark'
                    }`}
                  >
                    Online Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-3 rounded-xl text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-dark/70 hover:bg-gray-100 hover:text-dark'
                    }`}
                  >
                    Cash on Delivery (COD)
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Mock card layout visualization */}
                    <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-accent-sage p-5 text-white flex flex-col justify-between shadow-md overflow-hidden">
                      <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                        <CreditCard size={180} />
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded">TreeBorn Care</span>
                        <div className="w-10 h-7 bg-white/10 rounded flex items-center justify-center backdrop-blur-xs font-mono font-bold text-[10px]">VISA</div>
                      </div>
                      <div className="space-y-2">
                        <span className="block font-mono text-sm sm:text-base tracking-widest">
                          {paymentInfo.cardNumber || '•••• •••• •••• ••••'}
                        </span>
                        <div className="flex justify-between text-[10px] uppercase font-mono">
                          <div>
                            <span className="block text-white/50 text-[8px]">Card Holder</span>
                            <span className="font-semibold">{paymentInfo.cardName || 'YOUR FULL NAME'}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-white/50 text-[8px]">Expires</span>
                            <span className="font-semibold">{paymentInfo.expiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5 sm:col-span-3">
                        <label className="text-xs font-semibold text-dark/70 font-display">Cardholder Full Name</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="Meet Chauhan"
                          value={paymentInfo.cardName}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/10"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-3">
                        <label className="text-xs font-semibold text-dark/70 font-display">Credit Card Number</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="4111 2222 3333 4444"
                          value={paymentInfo.cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/10 font-mono tracking-widest"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display">Expiry Date</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="MM/YY"
                          value={paymentInfo.expiry}
                          onChange={handleExpiryChange}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display">CVV Security Code</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="123"
                          value={paymentInfo.cvv}
                          onChange={handleCvvChange}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/10 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-[#F2F5FA] border border-border-gray rounded-xl p-3.5">
                      <ShieldCheck size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-gray-500 font-sans leading-relaxed">
                        Your details are processed with 256-bit bank-level SSL encryption. We never save raw credit credentials on our servers.
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-5 border border-[#1F7A4D]/25 bg-[#EBF3F0]/40 rounded-2xl space-y-3.5"
                  >
                    <div className="flex items-center gap-2 text-primary font-display font-semibold text-sm">
                      <Truck size={18} />
                      <span>Cash on Delivery (COD) Selected</span>
                    </div>
                    <p className="text-xs text-gray-600 font-sans leading-relaxed">
                      You will pay the total amount of <strong className="text-primary font-bold font-display">${total.toFixed(2)}</strong> in cash or via mobile UPI QR scan to the delivery associate when your botanical package arrives at your doorstep.
                    </p>
                    <div className="text-[10px] text-gray-500 font-sans space-y-1 pl-4 list-disc text-left">
                      <li>Free logistics shipping terms apply.</li>
                      <li>Please keep exact cash amount or mobile UPI apps ready at delivery.</li>
                      <li>Order confirmation invoice is sent instantly to your registered mail.</li>
                    </div>
                  </motion.div>
                )}

                {/* Submit Action */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-4 text-sm font-semibold tracking-wider uppercase rounded-full cursor-pointer flex justify-center items-center shadow-md focus:outline-none"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing Transaction...</span>
                      </span>
                    ) : (
                      <span>{paymentMethod === 'card' ? 'Authorize & Place Order' : 'Confirm COD Order'}</span>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white border border-border-gray/30 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border-gray/40 pb-4 mb-5">
                  <ShoppingBag size={18} className="text-primary" />
                  <h2 className="text-base font-display font-semibold text-dark">Bag Summary ({cart.reduce((s,i) => s + i.quantity, 0)})</h2>
                </div>

                {/* Items preview list */}
                <div className="divide-y divide-border-gray/30 border-b border-border-gray/40 pb-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}`} className="py-3 flex gap-3 text-xs font-sans first:pt-0">
                      <div className="w-12 h-12 bg-light-gray rounded-lg overflow-hidden border border-border-gray/20 flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-dark truncate">{item.product.name}</h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Size: {item.selectedSize} • Qty: {item.quantity}</span>
                      </div>
                      <span className="font-display font-bold text-dark">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Costs breakdown */}
                <div className="space-y-2 border-b border-border-gray/40 py-4 text-xs font-sans">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-dark">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Logistics Shipping</span>
                    <span className="font-semibold text-dark">
                      {shipping === 0 ? <span className="text-primary font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Est. Sales Tax (8%)</span>
                    <span className="font-semibold text-dark">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 font-display text-dark">
                  <span className="font-bold text-sm uppercase tracking-wider">Order Total</span>
                  <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </main>

      {/* Success Modal overlay */}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 border border-border-gray/20"
            >
              <div className="w-16 h-16 rounded-full bg-[#EBF3F0] text-primary flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-dark">Transaction Successful!</h3>
                <p className="text-xs text-gray-500 font-sans">
                  Thank you for your order. We are compiling your organic botanical selection.
                </p>
              </div>

              <div className="bg-light-gray/45 border border-border-gray/30 rounded-2xl p-4 text-xs font-mono text-left space-y-1.5 text-gray-650">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-bold text-dark">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold text-dark uppercase">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Charged:</span>
                  <span className="font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {whatsappOrderUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(whatsappOrderUrl, '_blank')}
                  className="w-full py-3 rounded-full font-semibold uppercase tracking-wider text-xs shadow-sm cursor-pointer border-[#16A34A] text-[#16A34A] hover:bg-green-50/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.73.001-2.597-1.006-5.038-2.834-6.87-1.827-1.83-4.258-2.836-6.857-2.837-5.442 0-9.87 4.372-9.873 9.734-.001 1.738.455 3.43 1.32 4.932l-.993 3.629 3.73-.978zm11.23-5.32c-.3-.15-1.772-.875-2.046-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.127-.992-1.89-2.22-2.112-2.6-.222-.38-.024-.585.126-.735.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.625-.926-2.225-.244-.589-.49-.51-.676-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 3.375-.275 2.725 1.7 5.35 1.95 5.675.25.325 3.42 5.22 8.28 7.32 1.155.498 2.058.796 2.76 1.02.822.26 1.57.223 2.16.136.66-.098 1.772-.725 2.022-1.425.25-.7.25-1.3 0-1.425-.075-.125-.275-.225-.575-.375z"/>
                  </svg>
                  <span>Send Order details to WhatsApp</span>
                </Button>
              )}

              <Button
                variant="primary"
                onClick={handleCompleteOrderSuccess}
                className="w-full py-3 rounded-full font-semibold uppercase tracking-wider text-xs shadow-sm cursor-pointer"
              >
                Back to Botanicals Store
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default Checkout;
