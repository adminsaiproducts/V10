// frontend/src/lib/api.ts

// Define the server-side API interface
export interface ServerFunctions {
  api_getCustomers: () => string; // Returns JSON string
  api_getCustomersPaginated: (page: number, pageSize: number, sortField?: string, sortOrder?: string) => string;
  api_searchCustomers: (query: string) => string;
  api_getCustomerById: (id: string) => string;
  api_createCustomer: (input: any) => string;
  api_updateCustomer: (id: string, input: any) => string;
  api_getAddressByZipCode: (zipCode: string) => string;
  api_getZipCodeByAddress: (prefecture: string, city: string, address1?: string) => string;
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
          resolve({
            customers: [
              { id: 'mock-1', name: 'Mock Customer 1 (Local)', email: 'local1@example.com', status: 'active' },
              { id: 'mock-2', name: 'Mock Customer 2 (Local)', email: 'local2@example.com', status: 'lead' }
            ],
            total: 2,
            page: 1,
            pageSize: 10
          });
          break;
        case 'api_getCustomerById':
          const id = args[0];
          resolve({
            id: id,
            name: `Mock Customer ${id} (Local)`,
            email: `local${id}@example.com`,
            phone: '090-1234-5678',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          break;
        case 'api_createCustomer':
          const input = args[0];
          resolve({
            id: 'new-mock-id-' + Date.now(),
            ...input,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          break;
        case 'api_updateCustomer':
          const updateId = args[0];
          const updateInput = args[1];
          resolve({
            id: updateId,
            ...updateInput,
            createdAt: new Date().toISOString(), // In reality, this would be preserved
            updatedAt: new Date().toISOString()
          });
          break;
        case 'api_getAddressByZipCode':
          const zipCode = args[0];
          if (zipCode === '100-0005') {
            // Mock: Single match
            resolve([{
              prefecture: 'Tokyo',
              city: 'Chiyoda-ku',
              address1: 'Marunouchi'
            }]);
          } else if (zipCode === '060-0000') {
            // Mock: Multiple matches
            resolve([
              { prefecture: 'Hokkaido', city: 'Sapporo-shi Chuo-ku', address1: '' },
              { prefecture: 'Hokkaido', city: 'Sapporo-shi Kita-ku', address1: '' }
            ]);
          } else {
            resolve([]);
          }
          break;
        case 'api_getZipCodeByAddress':
          const prefecture = args[0];
          const city = args[1];
          if (prefecture === 'Tokyo' && city === 'Chiyoda-ku') {
            resolve('1000005');
          } else {
            resolve(null);
          }
          break;
        default:
          resolve(null);
      }
    }, 500); // Simulate network delay
  });
};