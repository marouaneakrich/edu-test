import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database types
export interface EzOrder {
  id: string;
  org_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: 'cod';
  payment_status: 'pending' | 'paid';
  order_status: 'pending' | 'processing' | 'delivered';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface EzOrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface EzSubmission {
  id: string;
  org_id: string;
  form_type: 'contact' | 'appointment';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  child_age?: number;
  child_profile?: string;
  status: 'new' | 'contacted' | 'converted';
  created_at: string;
}
