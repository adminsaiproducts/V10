// src/services/CustomerService.ts
import { Customer, CustomerListResponse } from '../models/Customer';

export class CustomerService {
  /**
   * Get list of customers with pagination
   */
  getCustomers(page: number, pageSize: number): CustomerListResponse {
    // TODO: Replace with actual Firestore call
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: '山田 太郎',
        email: 'taro.yamada@example.com',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: '鈴木 花子',
        email: 'hanako.suzuki@example.com',
        status: 'lead',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return {
      data: mockCustomers,
      total: 2,
      page,
      pageSize
    };
  }

  /**
   * Get single customer by ID
   */
  getCustomerById(id: string): Customer | null {
    // TODO: Replace with actual Firestore call
    return {
      id,
      name: 'Mock Customer',
      email: 'mock@example.com',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
