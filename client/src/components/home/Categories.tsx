import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { SectionTitle } from '../layout/SectionTitle';
import { useStore } from '../../context/StoreContext';

export const Categories: React.FC = () => {
  const { categories, categoriesLoading } = useStore();
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <section id="categories" className="py-20 bg-light-gray">
      <Container>
        <SectionTitle
          badge="Curated Collections"
          title="Browse by Skin Concern & Category"
          description="Every skin is unique. Explore our cellular-level targeted treatments designed for specific skincare regimens."
        />

        {categoriesLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : activeCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-sans">
            No categories available at the moment.
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5">
            {activeCategories.map((category, idx) => (
              <motion.a
                href={`#shop?category=${category.slug}`}
                key={category.id || category._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative block overflow-hidden rounded-2xl w-[145px] sm:w-[170px] md:w-[180px] lg:w-[190px] aspect-[3/4] bg-dark shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer"
              >
                {/* Image */}
                <img
                  src={category.image}
                  alt={category.altText || category.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-75"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/20 to-transparent transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                  <span className="text-[10px] text-secondary font-bold font-display uppercase tracking-widest block mb-1 drop-shadow-sm">
                    {category.count} {category.count === 1 ? 'Product' : 'Products'}
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
        )}
      </Container>
    </section>
  );
};

export default Categories;
