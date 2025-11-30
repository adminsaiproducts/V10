// frontend/src/lib/api.ts

// Define the server-side API interface
export interface ServerFunctions {
  api_getCustomers: () => string; // Returns JSON string
  api_getCustomersPaginated: (page: number, pageSize: number, sortField?: string, sortOrder?: string) => string;
  api_searchCustomers: (query: string) => string;
}

// Type definition for google.script.run
declare global {
  interface Window {
    google?: {
      script: {
        run: {
          withSuccessHandler: (handler: (response: any) => void) => {
            withFailureHandler: (handler: (error: any) => void) => Record<string, (...args: any[]) => void>;
          };
        };
      };
    };
  }
}

/**
 * Generic API wrapper for Google Apps Script calls
 */
export const runGAS = <T>(functionName: keyof ServerFunctions, ...args: any[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    // Check if running in GAS environment
    if (window.google && window.google.script) {
      window.google.script.run
        .withSuccessHandler((response: any) => {
          try {
            // Parse JSON response if it's a string
            const result = typeof response === 'string' ? JSON.parse(response) : response;
            if (result.status === 'error') {
              reject(new Error(result.message));
            } else {
              resolve(result.data);
            }
          } catch (e) {
            reject(e);
          }
        })
        .withFailureHandler((error: any) => {
          reject(error);
        })
        [functionName](...args);
    } else {
      // Local development mock
      console.log(`[MOCK] Calling GAS function: ${functionName}`, args);
      mockResponse(functionName, args).then(resolve).catch(reject);
    }
  });
};

/**
 * Mock response handler for local development
 */
const mockResponse = (functionName: string, args: any[]): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Log args to avoid unused parameter warning
      console.log(`[MOCK] Processing ${functionName} with args:`, args);
      
      switch (functionName) {
        case 'api_getCustomers':
        case 'api_searchCustomers':
          resolve([
            { id: 'mock-1', name: 'Mock Customer 1 (Local)', email: 'local1@example.com', status: 'active' },
            { id: 'mock-2', name: 'Mock Customer 2 (Local)', email: 'local2@example.com', status: 'lead' }
          ]);
          break;
        case 'api_getCustomersPaginated':
          const page = args[0] || 1;
          const pageSize = args[1] || 10;
          resolve({
            items: [
              { id: `mock-${page}-1`, name: `Mock Customer 1 (Page ${page})`, email: `page${page}@example.com`, status: 'active' },
              { id: `mock-${page}-2`, name: `Mock Customer 2 (Page ${page})`, email: `page${page}@example.com`, status: 'lead' }
            ],
            total: 25, // Mock total
            page: page,
            pageSize: pageSize
          });
          break;
        default:
          resolve(null);
      }
    }, 500); // Simulate network delay
  });
};