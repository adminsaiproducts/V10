// src/main.ts - GAS Entry Point for CRM V10 (Aligned with V9 Pattern)
import { CustomerService } from './services/CustomerService';

/**
 * doGet - Serves the web application
 * Note: We avoid createTemplateFromFile because its scriptlet processing
 * breaks JavaScript code containing :// patterns (treats them as comments)
 */
function doGet(e: GoogleAppsScript.Events.DoGet) {
  try {
    Logger.log('doGet called with parameters: ' + JSON.stringify(e.parameter));

    // Build HTML directly without scriptlet processing
    const stylesheet = HtmlService.createHtmlOutputFromFile('stylesheet').getContent();
    const javascript = HtmlService.createHtmlOutputFromFile('javascript').getContent();

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM V10</title>
  ${stylesheet}
</head>
<body>
  <div id="root"></div>
  ${javascript}
</body>
</html>`;

    return HtmlService.createHtmlOutput(html)
      .setTitle('CRM V10')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error: any) {
    Logger.log('Error in doGet: ' + error.message);
    return HtmlService.createHtmlOutput(
      '<h1>Error</h1><p>' + error.message + '</p><pre>' + error.stack + '</pre>'
    );
  }
}

/**
 * doPost - Handles POST requests
 */
function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'POST request received',
        data: e.postData ? e.postData.contents : null
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error: any) {
    Logger.log('Error in doPost: ' + error.message);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * include - Helper for HTML template includes
 */
function include(filename: string) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * API: Get Customers
 */
function api_getCustomers() {
  try {
    const service = new CustomerService();
    // Default to page 1, size 10 for basic list
    const result = service.getCustomers(1, 10);
    
    return JSON.stringify({
      status: 'success',
      data: result.data
    });
  } catch (error: any) {
    Logger.log('Error in api_getCustomers: ' + error.message);
    return JSON.stringify({
      status: 'error',
      message: error.message,
      data: []
    });
  }
}

/**
 * API: Get Customers Paginated
 */
function api_getCustomersPaginated(page: number, pageSize: number, sortField?: string, sortOrder?: string) {
  try {
    Logger.log(`Pagination: page=${page}, pageSize=${pageSize}, sortField=${sortField || 'none'}, sortOrder=${sortOrder || 'none'}`);
    
    const service = new CustomerService();
    const result = service.getCustomers(page, pageSize);
    
    return JSON.stringify({
      status: 'success',
      data: {
        customers: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize
      }
    });
  } catch (error: any) {
    Logger.log('Error in api_getCustomersPaginated: ' + error.message);
    return JSON.stringify({
      status: 'error',
      message: error.message,
      data: [],
      total: 0
    });
  }
}

/**
 * API: Search Customers
 */
function api_searchCustomers(query: string) {
  try {
    const service = new CustomerService();
    const result = service.searchCustomers(query);
    
    return JSON.stringify({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    Logger.log('Error in api_searchCustomers: ' + error.message);
    return JSON.stringify({
      status: 'error',
      message: error.message,
      data: []
    });
  }
}

/**
 * API: Get Customer By ID
 */
function api_getCustomerById(id: string) {
  try {
    const service = new CustomerService();
    const result = service.getCustomerById(id);
    
    if (!result) {
      return JSON.stringify({
        status: 'error',
        message: 'Customer not found'
      });
    }

    return JSON.stringify({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    Logger.log('Error in api_getCustomerById: ' + error.message);
    return JSON.stringify({
      status: 'error',
      message: error.message
    });
  }
}

/**
 * API: Create Customer
 */
function api_createCustomer(data: any) {
  try {
    const service = new CustomerService();
    const result = service.createCustomer(data);
    
    return JSON.stringify({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    Logger.log('Error in api_createCustomer: ' + error.message);
    return JSON.stringify({
      status: 'error',
      message: error.message
    });
  }
}

/**
 * API: Update Customer
 */
function api_updateCustomer(id: string, data: any) {
  try {
    const service = new CustomerService();
    const result = service.updateCustomer(id, data);
    
    return JSON.stringify({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    Logger.log('Error in api_updateCustomer: ' + error.message);
    return JSON.stringify({
      status: 'error',
      message: error.message
    });
  }
}

/**
 * API: Get Address by Zip Code
 * Returns an array of addresses (some zip codes have multiple cities)
 */
function api_getAddressByZipCode(zipCode: string) {
  try {
    const service = new CustomerService();
    const results = service.getAddressByZipCode(zipCode);

    if (!results || results.length === 0) {
      return JSON.stringify({
        status: 'error',
        message: 'Address not found or invalid zip code'
      });
    }

    return JSON.stringify({
      status: 'success',
      data: results // Now returns an array
    });
  } catch (error: any) {
    Logger.log('Error in api_getAddressByZipCode: ' + error.message);
    return JSON.stringify({
      status: 'error',
      message: error.message
    });
  }
}

/**
 * API: Get Zip Code by Address (Reverse lookup)
 * Requires GOOGLE_MAPS_API_KEY in Script Properties
 */
function api_getZipCodeByAddress(prefecture: string, city: string, address1?: string) {
  try {
    const service = new CustomerService();
    const result = service.getZipCodeByAddress(prefecture, city, address1);

    if (!result) {
      return JSON.stringify({
        status: 'error',
        message: 'Zip code not found for the given address'
      });
    }

    return JSON.stringify({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    Logger.log('Error in api_getZipCodeByAddress: ' + error.message);
    return JSON.stringify({
      status: 'error',
      message: error.message
    });
  }
}

// Export functions to globalThis for GAS runtime recognition
(globalThis as any).doGet = doGet;
(globalThis as any).doPost = doPost;
(globalThis as any).include = include;
(globalThis as any).api_getCustomers = api_getCustomers;
(globalThis as any).api_getCustomersPaginated = api_getCustomersPaginated;
(globalThis as any).api_searchCustomers = api_searchCustomers;
(globalThis as any).api_getCustomerById = api_getCustomerById;
(globalThis as any).api_createCustomer = api_createCustomer;
(globalThis as any).api_updateCustomer = api_updateCustomer;
(globalThis as any).api_getAddressByZipCode = api_getAddressByZipCode;
(globalThis as any).api_getZipCodeByAddress = api_getZipCodeByAddress;