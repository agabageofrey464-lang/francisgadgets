export type UserRole = "customer" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text: string | null;
  position: number;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  stock_quantity: number;
  is_active: boolean;
  images: ProductImage[];
  category: Category | null;
}

export interface Product extends ProductListItem {
  description: string | null;
  sku: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code?: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  email: string;
  phone: string;
  status: OrderStatus;
  currency: string;
  subtotal: string;
  shipping_fee: string;
  total: string;
  shipping_address: ShippingAddress;
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: User;
}

export interface DashboardStats {
  total_sales: string;
  orders_count: number;
  pending_orders: number;
  customers_count: number;
  products_count: number;
  categories_count: number;
  low_stock_products: ProductListItem[];
  recent_orders: Order[];
}
