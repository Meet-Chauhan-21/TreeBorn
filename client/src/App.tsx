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
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}

export default App;
