// src/models/Customer.ts
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  zipCode?: string;
  prefecture?: string;
  city?: string;
  address1?: string; // Street address
  address2?: string; // Building name, etc.
  status: 'active' | 'inactive' | 'lead';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}
