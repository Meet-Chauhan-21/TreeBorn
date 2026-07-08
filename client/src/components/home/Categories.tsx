import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { SectionTitle } from '../layout/SectionTitle';
import { CATEGORIES } from '../../data/mockData';

export const Categories: React.FC = () => {
  return (
    <section id="categories" className="py-20 bg-light-gray">
      <Container>
        <SectionTitle
          badge="Curated Collections"
          title="Browse by Skin Concern & Category"
          description="Every skin is unique. Explore our cellular-level targeted treatments designed for specific skincare regimens."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {CATEGORIES.map((category, idx) => (
            <motion.a
              href={`#shop?category=${category.slug}`}
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group relative block overflow-hidden rounded-2xl aspect-[3/4] bg-dark shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer"
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-75"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/20 to-transparent transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] text-secondary font-bold font-display uppercase tracking-widest block mb-1 drop-shadow-sm">
                  {category.count} Products
                </span>
                <h3 className="font-display font-semibold text-base sm:text-lg tracking-tight drop-shadow-md">
                  {category.name}
                </h3>
                
                {/* Explore under line */}
                <div className="mt-2 flex items-center gap-1 text-[11px] font-sans text-white/70 group-hover:text-white transition-colors">
                  <span className="relative">
                    Explore
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Categories;
