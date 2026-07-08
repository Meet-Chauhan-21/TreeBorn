import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Star, Quote } from 'lucide-react';
import { Container } from '../layout/Container';
import { SectionTitle } from '../layout/SectionTitle';
import { TESTIMONIALS } from '../../data/mockData';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 bg-light-gray/40 relative overflow-hidden">
      {/* Background visual asset */}
      <div className="absolute left-0 bottom-0 w-[400px] h-[400px] rounded-full bg-secondary/3 blur-[80px] -z-10" />

      <Container>
        <SectionTitle
          badge="Testimonials"
          title="Loved by Skin Experts & Purists"
          description="Don't just take our word for it. Discover reviews from dermatologists, skincare professionals, and loyal clients."
        />

        <div className="pb-12">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="testimonial-swiper !pb-14"
          >
            {TESTIMONIALS.map((testimonial) => (
              <SwiperSlide key={testimonial.id} className="h-auto">
                <div className="bg-white border border-border-gray/30 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full justify-between relative">
                  
                  {/* Quote Icon Background Decorator */}
                  <div className="absolute right-6 top-6 text-primary/5">
                    <Quote size={56} strokeWidth={1} fill="currentColor" />
                  </div>

                  <div>
                    {/* Star Rating */}
                    <div className="flex text-yellow-400 mb-5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" className="stroke-1" />
                      ))}
                    </div>

                    {/* Review text */}
                    <p className="text-gray-600 text-sm font-sans leading-relaxed italic mb-6">
                      "{testimonial.review}"
                    </p>
                  </div>

                  {/* Profile section */}
                  <div className="flex items-center gap-4 border-t border-border-gray/40 pt-5">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover shadow-sm flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-display font-semibold text-sm text-dark flex items-center gap-1.5">
                        {testimonial.name}
                        {testimonial.isVerified && (
                          <span className="inline-block w-3.5 h-3.5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-[8px] font-sans font-bold">
                            ✓
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 font-sans">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
