import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import ProductModal from './ProductModal';

export const Layout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <Outlet />
      <CartDrawer />
      <WishlistDrawer />
      <ProductModal />
    </>
  );
};

export default Layout;
