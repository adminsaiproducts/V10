declare namespace FirestoreApp {
  interface Firestore {
    projectId: string; // Add this property
    getDocuments(path: string): any[];
    getDocument(path: string): any;
    createDocument(path: string, data: any): any;
    updateDocument(path: string, data: any): any;
    deleteDocument(path: string): any;
    query(path: string): Query;
  }

  interface Query {
    where(field: string, operator: string, value: any): Query;
    orderBy(field: string, direction?: 'asc' | 'desc'): Query;
    limit(limit: number): Query;
    range(limit: number): Query; // Legacy/Alternative name for limit? Check library docs if needed
    execute(): any[];
  }

  function getFirestore(email: string, key: string, projectId: string): Firestore;
}