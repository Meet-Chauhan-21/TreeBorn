import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api/users';

export interface Address {
  _id?: string;
  name: string;
  phone: string;
  street: string;
  country: string;
  state: string;
  district: string;
  zip: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  shippingAddress?: Omit<Address, '_id'>;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  payment?: {
    method: string;
    status: string;
    cardName?: string;
    cardLast4?: string;
  };
  createdAt?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  addresses?: Address[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>; // phone is now required
  googleLogin: () => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<boolean>; // backend integrated
  addAddress: (address: Omit<Address, '_id'>) => Promise<boolean>;
  updateAddress: (addressId: string, address: Omit<Address, '_id'>) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  placeOrder: (payload: {
    items: OrderItem[];
    shippingAddress: Omit<Address, '_id'>;
    paymentMethod: 'card' | 'cod';
    paymentDetails?: { cardName?: string; cardLast4?: string };
    totals: { subtotal: number; shipping: number; tax: number; total: number };
  }) => Promise<{ order: Order } | null>;
  fetchOrders: (
    page?: number,
    limit?: number
  ) => Promise<{ orders: Order[]; total: number; page: number; limit: number } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profile using an access token
  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const avatar = data.user.name
          ? data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
          : 'U';
        return {
          ...data.user,
          avatar,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Perform silent token refresh on app mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // vital to send/receive httpOnly cookies
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
          const profile = await fetchUserProfile(data.accessToken);
          if (profile) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Failed to initialize session refresh:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Login failed. Please check credentials.');
        setLoading(false);
        return false;
      }

      setAccessToken(data.accessToken);
      const avatar = data.user.name
        ? data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U';
      const sessionUser = {
        ...data.user,
        avatar,
      };

      setUser(sessionUser);
      toast.success(`Welcome back, ${sessionUser.name}!`);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Server error during login.');
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Registration failed.');
        setLoading(false);
        return false;
      }

      setAccessToken(data.accessToken);
      const avatar = name
        ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U';
      const sessionUser = {
        ...data.user,
        avatar,
      };

      setUser(sessionUser);
      toast.success(`Account created successfully! Welcome to TreeBorn, ${name}.`);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Server error during registration.');
      setLoading(false);
      return false;
    }
  };

  const googleLogin = () => {
    toast.info('Google Login Mock: In production this connects to OAuth endpoints.');
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      toast.info('You have logged out of your account.');
    }
  };

  // PUT /api/users/profile
  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!accessToken) {
      toast.error('Session expired. Please log in again.');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: updatedData.name,
          email: updatedData.email,
          phone: updatedData.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to update profile settings.');
        return false;
      }

      const avatar = data.user.name
        ? data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'U';

      setUser({
        ...data.user,
        avatar
      });
      return true;
    } catch (error) {
      console.error('Update profile fetch error:', error);
      toast.error('Network error. Failed to update profile.');
      return false;
    }
  };

  // POST /api/users/addresses
  const addAddress = async (address: Omit<Address, '_id'>): Promise<boolean> => {
    if (!accessToken) {
      toast.error('Session expired. Please log in.');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(address)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to add address.');
        return false;
      }

      if (user) {
        setUser({ ...user, addresses: data.addresses });
      }
      toast.success('Address added successfully!');
      return true;
    } catch (error) {
      console.error('Add address error:', error);
      toast.error('Failed to add address.');
      return false;
    }
  };

  // PUT /api/users/addresses/:addressId
  const updateAddress = async (addressId: string, address: Omit<Address, '_id'>): Promise<boolean> => {
    if (!accessToken) {
      toast.error('Session expired. Please log in.');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(address)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to update address.');
        return false;
      }

      if (user) {
        setUser({ ...user, addresses: data.addresses });
      }
      toast.success('Address updated successfully!');
      return true;
    } catch (error) {
      console.error('Update address error:', error);
      toast.error('Failed to update address.');
      return false;
    }
  };

  // DELETE /api/users/addresses/:addressId
  const deleteAddress = async (addressId: string): Promise<boolean> => {
    if (!accessToken) {
      toast.error('Session expired. Please log in.');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to delete address.');
        return false;
      }

      if (user) {
        setUser({ ...user, addresses: data.addresses });
      }
      toast.success('Address deleted successfully!');
      return true;
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error('Failed to delete address.');
      return false;
    }
  };

  const placeOrder = async (payload: {
    items: OrderItem[];
    shippingAddress: Omit<Address, '_id'>;
    paymentMethod: 'card' | 'cod';
    paymentDetails?: { cardName?: string; cardLast4?: string };
    totals: { subtotal: number; shipping: number; tax: number; total: number };
  }): Promise<{ order: Order } | null> => {
    if (!accessToken) {
      toast.error('Session expired. Please log in.');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: payload.items,
          shippingAddress: payload.shippingAddress,
          paymentMethod: payload.paymentMethod,
          paymentDetails: payload.paymentDetails,
          totals: payload.totals
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to place order.');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Place order error:', error);
      toast.error('Network error. Failed to place order.');
      return null;
    }
  };

  const fetchOrders = async (
    page: number = 1,
    limit: number = 3
  ): Promise<{ orders: Order[]; total: number; page: number; limit: number } | null> => {
    if (!accessToken) {
      toast.error('Session expired. Please log in.');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/orders?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to fetch orders.');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Network error. Failed to fetch orders.');
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        addAddress,
        updateAddress,
        deleteAddress,
        placeOrder,
        fetchOrders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
