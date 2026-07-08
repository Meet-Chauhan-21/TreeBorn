import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import router from './routes';
import { StoreProvider } from './context/StoreContext';
import CartDrawer from './components/layout/CartDrawer';
import WishlistDrawer from './components/layout/WishlistDrawer';
import ProductModal from './components/layout/ProductModal';

function App() {
  return (
    <HelmetProvider>
      <StoreProvider>
        <RouterProvider router={router} />
        <CartDrawer />
        <WishlistDrawer />
        <ProductModal />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0F3D2E',
              color: '#FFFFFF',
              border: '1px solid #1F7A4D',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </StoreProvider>
    </HelmetProvider>
  );
}

export default App;
