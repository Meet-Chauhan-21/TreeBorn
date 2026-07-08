import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Container } from '../layout/Container';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Welcome to the AURA Circle! Check your inbox for your 15% discount code.');
      setEmail('');
    }, 1200);
  };

  return (
    <section id="contact" className="py-20 bg-white relative overflow-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden bg-primary px-8 py-16 sm:px-12 sm:py-20 md:py-24 text-center shadow-xl border border-primary-light"
        >
          {/* Subtle gradient blob inside card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-dark via-primary to-secondary/20 -z-10" />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-secondary/10 blur-3xl -z-10" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary-dark/40 blur-3xl -z-10" />

          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Minimal Icon Badge */}
            <div className="inline-flex w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-white">
              <Mail size={22} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Join the AURA Circle
            </h2>
            
            <p className="text-white/70 text-sm sm:text-base font-sans max-w-lg mx-auto leading-relaxed">
              Subscribe to receive curated botanical science briefs, exclusive early product drops, and 15% off your next order.
            </p>

            {/* Subscribe Form */}
            <form onSubmit={handleSubscribe} className="pt-4 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 items-center bg-white/5 p-1.5 rounded-2xl sm:rounded-full border border-white/15 focus-within:border-white/35 transition-all">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-transparent border-none text-white text-sm px-4 py-3 placeholder-white/50 focus:outline-none font-sans"
                  required
                />
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-white text-primary hover:bg-light-gray active:scale-[0.98] transition-all px-6 py-3 rounded-xl sm:rounded-full font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <span className="block text-[11px] text-white/40 font-sans">
              We respect your privacy. Unsubscribe at any time.
            </span>

          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default Newsletter;
