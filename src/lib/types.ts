export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  images: string[];
  colors?: ProductColor[];
  sizes?: string[];
  shortDescription: string;
  description: string;
  details: string[];
  materials?: string;
  care?: string;
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  stock: number;
  sku: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  color?: string;
  size?: string;
  quantity: number;
  sku: string;
};

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
};
