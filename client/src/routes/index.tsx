import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import ProductDetail from '../pages/ProductDetail';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Checkout from '../pages/Checkout';
import GoogleLoginMock from '../pages/GoogleLoginMock';
import Layout from '../components/layout/Layout';
import AdminDashboard from '../pages/AdminDashboard';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/product/:id',
        element: <ProductDetail />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/checkout',
        element: <Checkout />,
      },
      {
        path: '/google-login-mock',
        element: <GoogleLoginMock />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
]);

export default router;
