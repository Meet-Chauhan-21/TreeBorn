import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Container } from '../layout/Container';
import { useStore } from '../../context/StoreContext';

export const Newsletter: React.FC = () => {
  const { settings } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const formatWhatsAppLink = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    return cleanNum.length === 10 ? `91${cleanNum}` : cleanNum;
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Full name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email address is required'),
    message: Yup.string()
      .min(10, 'Message must be at least 10 characters')
      .required('Message is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setIsLoading(false);
        
        // Format a professional WhatsApp message
        let textMsg = `━━━━━━━━━━━━━━━━━━━━━\n`;
        textMsg += `🌿 *TREEBORN - CONTACT INQUIRY* 🌿\n`;
        textMsg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        textMsg += `Hello TreeBorn Team, I would like to get in touch with you regarding your products/formulations. Here are my details:\n\n`;
        textMsg += `👤 *Name:* ${values.name}\n`;
        textMsg += `📧 *Email:* ${values.email}\n\n`;
        textMsg += `💬 *Message:*\n"${values.message}"\n\n`;
        textMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        textMsg += `Please review and get back. Thank you!`;

        const encodedMessage = encodeURIComponent(textMsg);
        const whatsappUrl = `https://wa.me/${formatWhatsAppLink(settings.whatsappNumber)}?text=${encodedMessage}`;

        try {
          window.open(whatsappUrl, '_blank');
        } catch (e) {
          console.error('Popup blocked by browser:', e);
        }

        toast.success(`Thank you, ${values.name}! Your inquiry has been prepared for WhatsApp.`);
        resetForm();
      }, 1000);
    },
  });

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden font-sans border-t border-slate-100">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-8"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-widest block mb-2 font-display text-primary">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight leading-tight">
                Connect with TreeBorn
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-4 leading-relaxed">
                Have questions about our low-temperature molecular bio-fractionation or 100% zero-waste packaging? Reach out to our botanical skincare specialists.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 flex-shrink-0 border border-slate-200/50">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Support</h4>
                  <a href={`mailto:${settings.email}`} className="text-sm font-semibold text-slate-800 hover:text-primary transition-colors mt-0.5 block">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 flex-shrink-0 border border-slate-200/50">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">WhatsApp Line</h4>
                  <a
                    href={`https://wa.me/${formatWhatsAppLink(settings.whatsappNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-slate-800 hover:text-primary transition-colors mt-0.5 block"
                  >
                    {settings.whatsappNumber.startsWith('+') || settings.whatsappNumber.startsWith('91')
                      ? settings.whatsappNumber
                      : `+91 ${settings.whatsappNumber}`}
                  </a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 flex-shrink-0 border border-slate-200/50">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Formulation Labs</h4>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-relaxed">
                    TreeBorn Skincare Labs, 100 Zero-Waste Parkway, Portland, OR 97201
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 flex-shrink-0 border border-slate-200/50">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Lab Hours</h4>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    Monday – Friday: 9:00 AM – 6:00 PM EST
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Clean Form (Yup + Formik Validation, Narrower container w-full max-w-md lg:ml-auto) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 max-w-md lg:ml-auto w-full"
          >
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. Sanjay Dabhi"
                  className={`w-full bg-transparent border-b transition-colors py-3 text-slate-800 placeholder-slate-400 text-sm font-sans focus:outline-none rounded-none ${formik.touched.name && formik.errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-slate-800'
                    }`}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{formik.errors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. sanjay@example.com"
                  className={`w-full bg-transparent border-b transition-colors py-3 text-slate-800 placeholder-slate-400 text-sm font-sans focus:outline-none rounded-none ${formik.touched.email && formik.errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-slate-800'
                    }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{formik.errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Tell us how we can help you..."
                  className={`w-full bg-transparent border-b transition-colors py-3 text-slate-800 placeholder-slate-400 text-sm font-sans focus:outline-none min-h-[120px] resize-y rounded-none ${formik.touched.message && formik.errors.message ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-slate-800'
                    }`}
                />
                {formik.touched.message && formik.errors.message && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{formik.errors.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-primary hover:opacity-90 active:scale-[0.98] transition-all text-white px-8 py-3.5 rounded-xl text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={13} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

        </div>
      </Container>
    </section>
  );
};

export default Newsletter;
