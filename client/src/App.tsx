import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';
import router from './routes';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <HelmetProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <StoreProvider>
            <RouterProvider router={router} />
            <Toaster
              position="top-right"
              duration={1500}
              toastOptions={{
                style: {
                  background: 'var(--color-primary, #581C87)',
                  color: '#FFFFFF',
                  border: '1.5px solid var(--color-primary-light, #7C3AED)',
                  fontFamily: 'var(--font-sans)',
                  borderRadius: '12px',
                },
              }}
            />
          </StoreProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}

export default App;
