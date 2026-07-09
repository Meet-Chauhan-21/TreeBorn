import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import ProductDetail from '../pages/ProductDetail';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Checkout from '../pages/Checkout';
import GoogleLoginMock from '../pages/GoogleLoginMock';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/admin/Dashboard';
import ProductsList from '../pages/admin/ProductsList';
import ProductForm from '../pages/admin/ProductForm';
import ProductView from '../pages/admin/ProductView';
import OrderView from '../pages/admin/OrderView';
import UserView from '../pages/admin/UserView';
import UsersList from '../pages/admin/UsersList';
import OrdersList from '../pages/admin/OrdersList';
import Settings from '../pages/admin/Settings';

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
    element: <Dashboard />,
  },
  {
    path: '/admin/products',
    element: <ProductsList />,
  },
  {
    path: '/admin/products/:id',
    element: <ProductView />,
  },
  {
    path: '/admin/products/create',
    element: <ProductForm />,
  },
  {
    path: '/admin/products/:id/edit',
    element: <ProductForm />,
  },
  {
    path: '/admin/users',
    element: <UsersList />,
  },
  {
    path: '/admin/users/:id',
    element: <UserView />,
  },
  {
    path: '/admin/orders',
    element: <OrdersList />,
  },
  {
    path: '/admin/orders/:id',
    element: <OrderView />,
  },
  {
    path: '/admin/settings',
    element: <Settings />,
  },
]);

export default router;
