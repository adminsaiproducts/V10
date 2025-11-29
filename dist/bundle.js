/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/services/CustomerService.ts
class CustomerService {
    /**
     * Get list of customers with pagination
     */
    getCustomers(page, pageSize) {
        // TODO: Replace with actual Firestore call
        const mockCustomers = [
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
    getCustomerById(id) {
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

;// ./src/server.ts
// src/server.ts - GAS Entry Point for CRM V10

/**
 * doGet - Serves the web application
 */
function doGet(e) {
    try {
        Logger.log('doGet called with parameters: ' + JSON.stringify(e.parameter));
        const template = HtmlService.createTemplateFromFile('index');
        return template.evaluate()
            .setTitle('CRM V10')
            .addMetaTag('viewport', 'width=device-width, initial-scale=1')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    catch (error) {
        Logger.log('Error in doGet: ' + error.message);
        return HtmlService.createHtmlOutput('<h1>Error</h1><p>' + error.message + '</p><pre>' + error.stack + '</pre>');
    }
}
/**
 * doPost - Handles POST requests
 */
function doPost(e) {
    try {
        return ContentService
            .createTextOutput(JSON.stringify({
            status: 'success',
            message: 'POST request received',
            data: e.postData ? e.postData.contents : null
        }))
            .setMimeType(ContentService.MimeType.JSON);
    }
    catch (error) {
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
function include(filename) {
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
    }
    catch (error) {
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
function api_getCustomersPaginated(page, pageSize, sortField, sortOrder) {
    try {
        Logger.log(`Pagination: page=${page}, pageSize=${pageSize}, sortField=${sortField || 'none'}, sortOrder=${sortOrder || 'none'}`);
        const service = new CustomerService();
        const result = service.getCustomers(page, pageSize);
        return JSON.stringify({
            status: 'success',
            data: result.data,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize
        });
    }
    catch (error) {
        Logger.log('Error in api_getCustomersPaginated: ' + error.message);
        return JSON.stringify({
            status: 'error',
            message: error.message,
            data: [],
            total: 0
        });
    }
}
// Export functions to globalThis for GAS runtime recognition
globalThis.doGet = doGet;
globalThis.doPost = doPost;
globalThis.include = include;
globalThis.api_getCustomers = api_getCustomers;
globalThis.api_getCustomersPaginated = api_getCustomersPaginated;

/******/ })()
;