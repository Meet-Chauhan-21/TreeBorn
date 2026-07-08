import React from 'react';
import { motion } from 'framer-motion';
import { Star, Check, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Container } from '../layout/Container';
import { Button } from '../layout/Button';
import { PRODUCTS } from '../../data/mockData';

export const BestSeller: React.FC = () => {
  const bestseller = PRODUCTS.find((p) => p.id === 'prod-01') || PRODUCTS[0];

  const handleAddToCart = () => {
    toast.success(`${bestseller.name} added to shopping bag.`);
  };

  return (
    <section className="py-20 bg-light-gray relative overflow-hidden">
      {/* Background shape */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[80px] -z-10" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Flagship Image close-up */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
            >
              <img
                src="https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop"
                alt="Peptide Serum Application"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
              />
            </motion.div>
            
            {/* Absolute badge */}
            <div className="absolute -bottom-6 -right-6 glassmorphism p-5 rounded-2xl border border-white/80 shadow-lg hidden sm:block max-w-[200px]">
              <span className="text-2xl font-display font-bold text-primary block">96%</span>
              <span className="text-xs text-gray-600 font-sans leading-tight block mt-1">
                of buyers reported visible firming & hydration in 7 days.
              </span>
            </div>
          </div>

          {/* Details Content */}
          <div className="lg:col-span-6 space-y-6 lg:pl-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <span className="text-xs font-bold font-display uppercase tracking-widest text-secondary">
                Spotlight Formulation
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-dark tracking-tight">
                {bestseller.name}
              </h2>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" className="stroke-1" />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-500 font-sans">
                  {bestseller.rating} based on {bestseller.reviewsCount} verified reviews
                </span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-600 font-sans leading-relaxed text-base"
            >
              {bestseller.description} Recalibrate your skin’s vitality. This formulation stimulates natural elastin production, repairs fine cellular structures, and reinforces deep dermal hydration.
            </motion.p>

            {/* Benefits Checkmarks */}
            <motion.ul
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {bestseller.benefits?.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-dark font-sans font-medium">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </motion.ul>

            {/* Active Ingredients Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-2.5 pt-4 border-t border-border-gray/60"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider text-dark/80 font-display">
                Key Actives:
              </h4>
              <div className="flex flex-wrap gap-2">
                {bestseller.ingredients?.map((ing) => (
                  <span
                    key={ing}
                    className="text-xs text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-full font-sans font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Buy Action */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-5 pt-4"
            >
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-display">
                  Special Offer Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display font-bold text-dark">
                    ${bestseller.price.toFixed(2)}
                  </span>
                  {bestseller.oldPrice && (
                    <span className="text-sm font-medium text-gray-400 line-through">
                      ${bestseller.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                onClick={handleAddToCart}
                variant="primary"
                size="md"
                leftIcon={<ShoppingBag size={16} />}
              >
                Add to Bag
              </Button>
            </motion.div>

          </div>

        </div>
      </Container>
    </section>
  );
};

export default BestSeller;
