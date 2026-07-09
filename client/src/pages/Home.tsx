import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import PromoBanner from '../components/home/PromoBanner';
import Categories from '../components/home/Categories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import BestSeller from '../components/home/BestSeller';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/layout/WhatsAppButton';

export const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>TREEBORN — Premium Botanical Skincare & Cellular Restoration</title>
        <meta name="description" content="Unlock your skin's biological potential with TREEBORN's premium, organic, cruelty-free skincare formulas. Experience advanced cellular science designed for natural glow." />
        <meta property="og:title" content="TREEBORN — Premium Botanical Skincare" />
        <meta property="og:description" content="Pure botanical active formulas designed for deep cellular renewal and moisture barrier restoration." />
      </Helmet>

      <Navbar />
      <main>
        <Hero />
        <PromoBanner />
        <Categories />
        <FeaturedProducts />
        <BestSeller />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
};

export default Home;
