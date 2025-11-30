// src/main.ts - GAS Entry Point for CRM V10 (Aligned with V9 Pattern)
import { CustomerService } from './services/CustomerService';

/**
 * doGet - Serves the web application
 */
function doGet(e: GoogleAppsScript.Events.DoGet) {
  try {
    Logger.log('doGet called with parameters: ' + JSON.stringify(e.parameter));
    const template = HtmlService.createTemplateFromFile('index');
    return template.evaluate()
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
        items: result.data,
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
      data: {
        items: [],
        total: 0,
        page: page,
        pageSize: pageSize
      }
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

// Export functions to globalThis for GAS runtime recognition
(globalThis as any).doGet = doGet;
(globalThis as any).doPost = doPost;
(globalThis as any).include = include;
(globalThis as any).api_getCustomers = api_getCustomers;
(globalThis as any).api_getCustomersPaginated = api_getCustomersPaginated;
(globalThis as any).api_searchCustomers = api_searchCustomers;