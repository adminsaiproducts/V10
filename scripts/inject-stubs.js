/**
 * scripts/inject-stubs.js
 * Appends top-level GAS function stubs to the Webpack-bundled script.
 * This ensures GAS can see the entry points like doGet() and api_Functions().
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const BUNDLE_PATH = path.join(DIST_DIR, 'bundle.js');

// 1. Define the functions we want to expose to GAS
//    These must match what's exported to `globalThis` in src/main.ts
const EXPOSED_FUNCTIONS = [
  'doGet',
  'doPost',
  'api_getCustomers',
  'api_getCustomersPaginated',
  'api_searchCustomers',
  'api_getCustomerById',
  'api_createCustomer',
  'api_updateCustomer',
  'api_getAddressByZipCode',
  'api_getZipCodeByAddress'
];

function main() {
  console.log('🌉 Adding GAS Bridge Stubs...');
  
  if (!fs.existsSync(BUNDLE_PATH)) {
    console.error('❌ bundle.js not found at:', BUNDLE_PATH);
    process.exit(1);
  }

  let content = fs.readFileSync(BUNDLE_PATH, 'utf8');

  // 2. Generate stubs
  //    GAS needs top-level function declarations to recognize them as entry points.
  //    We delegate the call to the global object where Webpack put the implementation.
  const stubs = EXPOSED_FUNCTIONS.map(funcName => {
    return `
function ${funcName}(...args) {
  return globalThis.${funcName}(...args);
}
`;
  }).join('\n');

  // 3. Append stubs to bundle
  content += '\n' + stubs;
  
  fs.writeFileSync(BUNDLE_PATH, content, 'utf8');
  console.log(`✅ Added GAS bridge stubs for: ${EXPOSED_FUNCTIONS.join(', ')}\n`);
}

main();