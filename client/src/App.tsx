import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import router from './routes';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <StoreProvider>
          <RouterProvider router={router} />
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
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
