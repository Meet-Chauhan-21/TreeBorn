import React from 'react';
import { Outlet } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import ProductModal from './ProductModal';

export const Layout: React.FC = () => {
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
