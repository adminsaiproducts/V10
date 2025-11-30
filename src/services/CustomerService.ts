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
    // Strategy: Accumulative Limit
    // Since we don't have a reliable cursor or offset in the library wrapper,
    // we fetch (page * pageSize) items and slice the last page.
    // This is better than fetching ALL documents, though performance degrades on deep pages.
    
    const collectionPath = `projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers`;
    const fetchLimit = page * pageSize;

    // Build Query
    // We order by createdAt desc to show newest customers first
    const query = this.firestore.query(collectionPath)
      .orderBy('createdAt', 'desc')
      .limit(fetchLimit);
    
    // Execute query
    const docs = query.execute();
    
    // Slice results for the requested page
    const startIndex = (page - 1) * pageSize;
    // docs might be less than fetchLimit if we reached end of collection
    const pagedDocs = docs.slice(startIndex, startIndex + pageSize);

    // Map to Customer interface
    const customers: Customer[] = pagedDocs.map((doc: any) => this.mapDocumentToCustomer(doc));

    // Calculate Total Logic
    // If we received fewer documents than the fetchLimit, we know the exact total is the length of docs.
    // Otherwise, we don't know the total (it's at least fetchLimit).
    let total = -1; // -1 indicates "unknown, possibly more"
    if (docs.length < fetchLimit) {
      total = docs.length;
    }

    return {
      data: customers,
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
