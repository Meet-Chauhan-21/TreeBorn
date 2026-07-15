export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  description: string;
  rating: number;
  reviewsCount: number;
  price: number;
  oldPrice?: number;
  discount?: number; // percentage, e.g., 15
  image: string;
  hoverImage: string;
  images?: string[];
  isBestSeller?: boolean;
  isNew?: boolean;
  isNewArrival?: boolean;
  ingredients?: string[];
  benefits?: string[];
  status?: 'active' | 'inactive' | string;
  stock?: number;
  sku?: string;
  volume?: string;
  video?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  image: string;
  altText?: string;
  isActive?: boolean;
  sortOrder?: number;
  count: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  review: string;
  rating: number;
  image: string;
  isVerified?: boolean;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string; // matches name in lucide-react
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  icon: string; // matches name in lucide-react
}

export interface CountryData {
  name: string;
  code: string;
  states: {
    name: string;
    districts: string[];
  }[];
}

export interface AppSettings {
  email: string;
  whatsappNumber: string;
  themeColor: string;
  enableCreditCard: boolean;
  enablePaypal: boolean;
  enableCOD: boolean;
  shopName?: string;
  address?: string;
  gstNumber?: string;
  logo?: string;
  homepageImages?: {
    spotlight: string;
    spotlightName?: string;
    spotlightDescription?: string;
    spotlightPrice?: number;
    spotlightOldPrice?: number | null;
    about: {
      main: string;
      secondary: string;
    };
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

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
  user?: User; // added optionally just in case some components reference it
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  addresses?: Address[];
}

