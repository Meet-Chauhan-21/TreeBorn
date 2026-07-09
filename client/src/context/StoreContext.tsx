import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';
import { fallbackProducts, fetchPublicProducts } from '../services/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: Product[];
  products: Product[];
  productsLoading: boolean;
  activeProduct: Product | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  addToCart: (product: Product, quantity: number, size?: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
  setActiveProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('treeborn_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [productsLoading, setProductsLoading] = useState(true);

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('treeborn_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProduct, setActiveProductState] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('treeborn_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('treeborn_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const apiProducts = await fetchPublicProducts();
        if (!cancelled) {
          setProducts(apiProducts);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = (product: Product, quantity: number, size = '50ml') => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );

      if (existingIdx > -1) {
        const newCart = [...prevCart];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      }

      return [...prevCart, { product, quantity, selectedSize: size }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearCart = () => {
    setCart([]);
  };

  const setActiveProduct = (product: Product | null) => {
    setActiveProductState(product);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        products,
        productsLoading,
        activeProduct,
        isCartOpen,
        isWishlistOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        isInWishlist,
        clearCart,
        setActiveProduct,
        setIsCartOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
