import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { Container } from '../layout/Container';
import { SectionTitle } from '../layout/SectionTitle';
import { WHY_CHOOSE_US } from '../../data/mockData';

export const WhyChooseUs: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf':
        return <Leaf className="text-primary" size={24} />;
      case 'Sparkles':
        return <Sparkles className="text-primary" size={24} />;
      case 'ShieldCheck':
        return <ShieldCheck className="text-primary" size={24} />;
      case 'Truck':
        return <Truck className="text-primary" size={24} />;
      default:
        return <Sparkles className="text-primary" size={24} />;
    }
  };

  return (
    <section id="about" className="py-20 bg-white">
      <Container>
        <SectionTitle
          badge="Our Values"
          title="Pure Botanicals, Proven Outcomes"
          description="We prioritize safety, ethics, and ecological longevity. Every luxury formula is designed to honor both your skin and our planet."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {WHY_CHOOSE_US.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-light-gray/60 border border-border-gray/30 hover:bg-white hover:shadow-xl hover:border-primary/10 transition-all duration-500 flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 flex-shrink-0">
                {getIcon(item.icon)}
              </div>
              <h3 className="font-display font-semibold text-lg text-dark mb-2.5">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed font-sans">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default WhyChooseUs;
