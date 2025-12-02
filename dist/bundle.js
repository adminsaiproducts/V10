/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 110:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerService = void 0;
class CustomerService {
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
    getCustomers(page, pageSize) {
        // Basic implementation: fetch all (or large limit) and slice
        // TODO: Optimize with cursor-based pagination when available
        // For V10 MVP, we fetch from the 'customers' collection
        const allDocs = this.firestore.getDocuments(`projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers`);
        // Map to Customer interface
        const customers = allDocs.map((doc) => this.mapDocumentToCustomer(doc));
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
    searchCustomers(query) {
        const allDocs = this.firestore.getDocuments(`projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers`);
        const customers = allDocs.map((doc) => this.mapDocumentToCustomer(doc));
        if (!query)
            return customers;
        const lowerQuery = query.toLowerCase();
        return customers.filter(c => c.name.toLowerCase().includes(lowerQuery) ||
            c.email.toLowerCase().includes(lowerQuery) ||
            (c.phone && c.phone.includes(query)));
    }
    /**
     * Get single customer by ID
     */
    getCustomerById(id) {
        try {
            const doc = this.firestore.getDocument(`projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers/${id}`);
            if (!doc || !doc.fields)
                return null;
            return this.mapDocumentToCustomer(doc);
        }
        catch (e) {
            console.warn(`Customer ${id} not found or error: ${e}`);
            return null;
        }
    }
    /**
     * Create a new customer
     */
    createCustomer(data) {
        const id = Utilities.getUuid();
        const path = `projects/${this.firestore.projectId}/databases/${this.dbId}/documents/customers/${id}`;
        const docData = {
            fields: {
                name: { stringValue: data.name },
                email: { stringValue: data.email },
                phone: { stringValue: data.phone || '' },
                zipCode: { stringValue: data.zipCode || '' },
                prefecture: { stringValue: data.prefecture || '' },
                city: { stringValue: data.city || '' },
                address1: { stringValue: data.address1 || '' },
                address2: { stringValue: data.address2 || '' },
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
    updateCustomer(id, data) {
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
                zipCode: { stringValue: data.zipCode || '' },
                prefecture: { stringValue: data.prefecture || '' },
                city: { stringValue: data.city || '' },
                address1: { stringValue: data.address1 || '' },
                address2: { stringValue: data.address2 || '' },
                status: { stringValue: data.status || 'lead' },
                createdAt: existingDoc.fields.createdAt, // Preserve creation time
                updatedAt: { timestampValue: new Date().toISOString() }
            }
        };
        const updatedDoc = this.firestore.updateDocument(path, docData);
        return this.mapDocumentToCustomer(updatedDoc);
    }
    /**
     * Fetch address from zip code using external API
     * Returns all matching addresses (some zip codes have multiple cities)
     */
    getAddressByZipCode(zipCode) {
        if (!zipCode || zipCode.length < 7)
            return [];
        // Remove hyphen if present (e.g., "123-4567" -> "1234567")
        const cleanZipCode = zipCode.replace(/-/g, '');
        try {
            const response = UrlFetchApp.fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZipCode}`);
            const json = JSON.parse(response.getContentText());
            if (json.status === 200 && json.results && json.results.length > 0) {
                // Return all results (some zip codes have multiple cities)
                return json.results.map((result) => ({
                    prefecture: result.address1,
                    city: result.address2,
                    address1: result.address3
                }));
            }
            return [];
        }
        catch (e) {
            console.warn(`Failed to fetch address for zip code ${zipCode}: ${e}`);
            return [];
        }
    }
    /**
     * Reverse lookup: Find zip code from address using Google Maps Geocoding API
     * Requires GOOGLE_MAPS_API_KEY in Script Properties
     */
    getZipCodeByAddress(prefecture, city, address1) {
        if (!prefecture)
            return null;
        try {
            const props = PropertiesService.getScriptProperties();
            const apiKey = props.getProperty('GOOGLE_MAPS_API_KEY');
            if (!apiKey) {
                console.warn('GOOGLE_MAPS_API_KEY not found in Script Properties. Reverse lookup disabled.');
                return null;
            }
            // Build address string
            const addressQuery = [prefecture, city, address1].filter(Boolean).join(' ');
            const encodedAddress = encodeURIComponent(addressQuery);
            // Call Google Maps Geocoding API
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&language=ja&region=jp&key=${apiKey}`;
            const response = UrlFetchApp.fetch(url);
            const json = JSON.parse(response.getContentText());
            if (json.status === 'OK' && json.results && json.results.length > 0) {
                const result = json.results[0];
                // Extract postal code from address components
                const postalCodeComponent = result.address_components.find((component) => component.types.includes('postal_code'));
                if (postalCodeComponent) {
                    return postalCodeComponent.long_name.replace(/-/g, ''); // Remove hyphen
                }
            }
            console.warn(`No postal code found for address: ${addressQuery}`);
            return null;
        }
        catch (e) {
            console.warn(`Failed to fetch zip code for address ${prefecture} ${city}: ${e}`);
            return null;
        }
    }
    mapDocumentToCustomer(doc) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const fields = doc.fields || {};
        return {
            id: doc.name.split('/').pop(), // Extract ID from path
            name: ((_a = fields.name) === null || _a === void 0 ? void 0 : _a.stringValue) || 'Unknown',
            email: ((_b = fields.email) === null || _b === void 0 ? void 0 : _b.stringValue) || '',
            phone: (_c = fields.phone) === null || _c === void 0 ? void 0 : _c.stringValue,
            zipCode: (_d = fields.zipCode) === null || _d === void 0 ? void 0 : _d.stringValue,
            prefecture: (_e = fields.prefecture) === null || _e === void 0 ? void 0 : _e.stringValue,
            city: (_f = fields.city) === null || _f === void 0 ? void 0 : _f.stringValue,
            address1: (_g = fields.address1) === null || _g === void 0 ? void 0 : _g.stringValue,
            address2: (_h = fields.address2) === null || _h === void 0 ? void 0 : _h.stringValue,
            status: ((_j = fields.status) === null || _j === void 0 ? void 0 : _j.stringValue) || 'lead',
            createdAt: ((_k = fields.createdAt) === null || _k === void 0 ? void 0 : _k.timestampValue) || new Date().toISOString(),
            updatedAt: ((_l = fields.updatedAt) === null || _l === void 0 ? void 0 : _l.timestampValue) || new Date().toISOString()
        };
    }
}
exports.CustomerService = CustomerService;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
// src/main.ts - GAS Entry Point for CRM V10 (Aligned with V9 Pattern)
const CustomerService_1 = __webpack_require__(110);
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
        const service = new CustomerService_1.CustomerService();
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
        const service = new CustomerService_1.CustomerService();
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
/**
 * API: Search Customers
 */
function api_searchCustomers(query) {
    try {
        const service = new CustomerService_1.CustomerService();
        const result = service.searchCustomers(query);
        return JSON.stringify({
            status: 'success',
            data: result
        });
    }
    catch (error) {
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
function api_getCustomerById(id) {
    try {
        const service = new CustomerService_1.CustomerService();
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
    }
    catch (error) {
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
function api_createCustomer(data) {
    try {
        const service = new CustomerService_1.CustomerService();
        const result = service.createCustomer(data);
        return JSON.stringify({
            status: 'success',
            data: result
        });
    }
    catch (error) {
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
function api_updateCustomer(id, data) {
    try {
        const service = new CustomerService_1.CustomerService();
        const result = service.updateCustomer(id, data);
        return JSON.stringify({
            status: 'success',
            data: result
        });
    }
    catch (error) {
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
function api_getAddressByZipCode(zipCode) {
    try {
        const service = new CustomerService_1.CustomerService();
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
    }
    catch (error) {
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
function api_getZipCodeByAddress(prefecture, city, address1) {
    try {
        const service = new CustomerService_1.CustomerService();
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
    }
    catch (error) {
        Logger.log('Error in api_getZipCodeByAddress: ' + error.message);
        return JSON.stringify({
            status: 'error',
            message: error.message
        });
    }
}
// Export functions to globalThis for GAS runtime recognition
globalThis.doGet = doGet;
globalThis.doPost = doPost;
globalThis.include = include;
globalThis.api_getCustomers = api_getCustomers;
globalThis.api_getCustomersPaginated = api_getCustomersPaginated;
globalThis.api_searchCustomers = api_searchCustomers;
globalThis.api_getCustomerById = api_getCustomerById;
globalThis.api_createCustomer = api_createCustomer;
globalThis.api_updateCustomer = api_updateCustomer;
globalThis.api_getAddressByZipCode = api_getAddressByZipCode;
globalThis.api_getZipCodeByAddress = api_getZipCodeByAddress;

})();

/******/ })()
;

function doGet(...args) {
  return globalThis.doGet(...args);
}


function doPost(...args) {
  return globalThis.doPost(...args);
}


function api_getCustomers(...args) {
  return globalThis.api_getCustomers(...args);
}


function api_getCustomersPaginated(...args) {
  return globalThis.api_getCustomersPaginated(...args);
}


function api_searchCustomers(...args) {
  return globalThis.api_searchCustomers(...args);
}


function api_getCustomerById(...args) {
  return globalThis.api_getCustomerById(...args);
}


function api_createCustomer(...args) {
  return globalThis.api_createCustomer(...args);
}


function api_updateCustomer(...args) {
  return globalThis.api_updateCustomer(...args);
}


function api_getAddressByZipCode(...args) {
  return globalThis.api_getAddressByZipCode(...args);
}


function api_getZipCodeByAddress(...args) {
  return globalThis.api_getZipCodeByAddress(...args);
}
