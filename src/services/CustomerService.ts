// src/services/CustomerService.ts
import { Customer, CustomerListResponse } from '../models/Customer';

export class CustomerService {
  private firestore: FirestoreApp.Firestore;
  private dbId: string;

  constructor() {
    const props = PropertiesService.getScriptProperties();
    const email = props.getProperty('FIRESTORE_EMAIL');
    const key = props.getProperty('FIRESTORE_KEY');
    const projectId = props.getProperty('FIRESTORE_PROJECT_ID');
    this.dbId = props.getProperty('FIRESTORE_DATABASE_ID') || '(default)';

    if (!email || !key || !projectId) {
      throw new Error('Firestore configuration missing in Script Properties');
    }

    this.firestore = FirestoreApp.getFirestore(email, key, projectId);
  }

  /**
   * Get list of customers with pagination
   * Note: FirestoreApp library has limited pagination support. 
   * This implementation gets a batch and filters/slices in memory for now, 
   * or relies on simple limit if the library supports it.
   */
  getCustomers(page: number, pageSize: number): CustomerListResponse {
    // Basic implementation: fetch all (or large limit) and slice
    // TODO: Optimize with cursor-based pagination when available
    
    // For V10 MVP, we fetch from the 'customers' collection
    const allDocs = this.firestore.getDocuments(`projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers`);
    
    // Map to Customer interface
    const customers: Customer[] = allDocs.map((doc: any) => this.mapDocumentToCustomer(doc));

    const total = customers.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedData = customers.slice(startIndex, endIndex);

    return {
      data: pagedData,
      total: total,
      page,
      pageSize
    };
  }

  /**
   * Search customers by name, email, or phone
   */
  searchCustomers(query: string): Customer[] {
    const allDocs = this.firestore.getDocuments(`projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers`);
    const customers: Customer[] = allDocs.map((doc: any) => this.mapDocumentToCustomer(doc));

    if (!query) return customers;

    const lowerQuery = query.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      (c.phone && c.phone.includes(query))
    );
  }

  /**
   * Get single customer by ID
   */
  getCustomerById(id: string): Customer | null {
    try {
      const doc = this.firestore.getDocument(`projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers/${id}`);
      
      if (!doc || !doc.fields) return null;

      return this.mapDocumentToCustomer(doc);
    } catch (e) {
      console.warn(`Customer ${id} not found or error: ${e}`);
      return null;
    }
  }
  /**
   * Create a new customer
   */
  createCustomer(data: any): Customer {
    const id = Utilities.getUuid();
    const path = `projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers/${id}`;
    
    const docData = {
      fields: {
        name: { stringValue: data.name },
        email: { stringValue: data.email },
        phone: { stringValue: data.phone || '' },
        status: { stringValue: data.status || 'lead' },
        createdAt: { timestampValue: new Date().toISOString() },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    };

    const createdDoc = this.firestore.createDocument(path, docData);
    return this.mapDocumentToCustomer(createdDoc);
  }
  /**
   * Update an existing customer
   */
  updateCustomer(id: string, data: any): Customer {
    const path = `projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers/${id}`;
    
    // First check if customer exists (optional but good for safety)
    // In a real app we might skip this round trip if we trust the ID, 
    // but preserving createdAt requires knowing it or not sending it if updateDocument is a PATCH.
    // Assuming updateDocument is a full replace or we want to be safe.
    // Let's fetch to get createdAt if we want to preserve it, or just use the existing one if we had it.
    // For now, let's just fetch it to be safe and preserve createdAt.
    const existingDoc = this.firestore.getDocument(path);
    if (!existingDoc || !existingDoc.fields) {
      throw new Error(`Customer with ID ${id} not found.`);
    }

    const docData = {
      fields: {
        name: { stringValue: data.name },
        email: { stringValue: data.email },
        phone: { stringValue: data.phone || '' },
        status: { stringValue: data.status || 'lead' },
        createdAt: existingDoc.fields.createdAt, // Preserve creation time
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    };

    const updatedDoc = this.firestore.updateDocument(path, docData);
    return this.mapDocumentToCustomer(updatedDoc);
  }

  private mapDocumentToCustomer(doc: any): Customer {
    const fields = doc.fields || {};
    return {
      id: doc.name.split('/').pop(), // Extract ID from path
      name: fields.name?.stringValue || 'Unknown',
      email: fields.email?.stringValue || '',
      phone: fields.phone?.stringValue,
      status: (fields.status?.stringValue as any) || 'lead',
      createdAt: fields.createdAt?.timestampValue || new Date().toISOString(),
      updatedAt: fields.updatedAt?.timestampValue || new Date().toISOString()
    };
  }
}
