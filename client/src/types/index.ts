export interface Product {
  id: string;
  name: string;
  category: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
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
