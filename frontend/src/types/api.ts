export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  imageUrl?: string;
  description?: string;
  order?: number;
}

export interface ProductVariant {
  _id: string;
  label: string;
  priceDelta: number;
  stockQuantity: number;
  isActive: boolean;
  sku?: string;
  attributes?: Record<string, string>;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category?: Category | string;
  categoryId?: Category;
  images: string[];
  basePrice: number;
  variants: ProductVariant[];
  tags: string[];
  inStock: boolean;
  isActive: boolean;
  flavor?: string;
  origin?: string;
  ingredients?: string[];
  brewing?: {
    temperature?: string;
    time?: string;
  };
}

export interface Analytics {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  revenue: number;
  lowStockCount: number;
  topProducts: { _id: string; title: string; totalSold: number; revenue: number }[];
  dailySeries: { _id: string; orders: number; revenue: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}
