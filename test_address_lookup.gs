/**
 * Test function for Address Lookup APIs
 *
 * These tests verify that the address lookup functionality is working correctly
 * in CRM V9 System.
 *
 * Instructions:
 * 1. Open CRM V9 System in GAS Editor
 * 2. Create a new .gs file called "test_address_lookup"
 * 3. Copy this entire code into that file
 * 4. Run the function "testAddressLookupAPIs" from the toolbar
 * 5. Check the execution log (表示 → ログ) for results
 */

function testAddressLookupAPIs() {
  Logger.log('=== Starting Address Lookup API Tests ===');
  Logger.log('');

  // Test 1: Zip code to address lookup (Tokyo Station area)
  Logger.log('Test 1: api_getAddressByZipCode("100-0005")');
  try {
    var result1 = api_getAddressByZipCode('100-0005');
    Logger.log('Result: ' + result1);
    var parsed1 = JSON.parse(result1);
    if (parsed1.status === 'success') {
      Logger.log('✓ Test 1 PASSED: Found ' + parsed1.data.length + ' address(es)');
      parsed1.data.forEach(function(addr, index) {
        Logger.log('  [' + index + '] ' + addr.prefecture + addr.city + addr.address1);
      });
    } else {
      Logger.log('✗ Test 1 FAILED: ' + parsed1.message);
    }
  } catch (e) {
    Logger.log('✗ Test 1 ERROR: ' + e.toString());
  }

  Logger.log('');
  Logger.log('---');
  Logger.log('');

  // Test 2: Address to zip code lookup (Tokyo Station - more specific address)
  Logger.log('Test 2: api_getZipCodeByAddress("東京都", "千代田区", "丸の内1-9-1")');
  try {
    var result2 = api_getZipCodeByAddress('東京都', '千代田区', '丸の内1-9-1');
    Logger.log('Result: ' + result2);
    var parsed2 = JSON.parse(result2);
    if (parsed2.status === 'success') {
      Logger.log('✓ Test 2 PASSED: Found zip code: ' + parsed2.data);
      Logger.log('  Expected: 1000005 (Tokyo Station area)');
    } else {
      Logger.log('✗ Test 2 FAILED: ' + parsed2.message);
    }
  } catch (e) {
    Logger.log('✗ Test 2 ERROR: ' + e.toString());
  }

  Logger.log('');
  Logger.log('---');
  Logger.log('');

  // Test 3: Invalid zip code (too short)
  Logger.log('Test 3: api_getAddressByZipCode("123") - Should handle error gracefully');
  try {
    var result3 = api_getAddressByZipCode('123');
    Logger.log('Result: ' + result3);
    var parsed3 = JSON.parse(result3);
    if (parsed3.status === 'error') {
      Logger.log('✓ Test 3 PASSED: Correctly returned error for invalid zip code');
    } else {
      Logger.log('✗ Test 3 FAILED: Should have returned error status');
    }
  } catch (e) {
    Logger.log('✗ Test 3 ERROR: ' + e.toString());
  }

  Logger.log('');
  Logger.log('---');
  Logger.log('');

  // Test 4: Address without address1 parameter (only prefecture and city)
  Logger.log('Test 4: api_getZipCodeByAddress("大阪府", "大阪市中央区", null)');
  try {
    var result4 = api_getZipCodeByAddress('大阪府', '大阪市中央区', null);
    Logger.log('Result: ' + result4);
    var parsed4 = JSON.parse(result4);
    if (parsed4.status === 'success' || parsed4.status === 'error') {
      Logger.log('✓ Test 4 PASSED: Handled null address1 parameter');
      if (parsed4.status === 'success') {
        Logger.log('  Found zip code: ' + parsed4.data);
      }
    }
  } catch (e) {
    Logger.log('✗ Test 4 ERROR: ' + e.toString());
  }

  Logger.log('');
  Logger.log('---');
  Logger.log('');

  // Test 5: Check if GOOGLE_MAPS_API_KEY is configured
  Logger.log('Test 5: Verify GOOGLE_MAPS_API_KEY configuration');
  try {
    var props = PropertiesService.getScriptProperties();
    var apiKey = props.getProperty('GOOGLE_MAPS_API_KEY');
    if (apiKey && apiKey.length > 0) {
      Logger.log('✓ Test 5 PASSED: GOOGLE_MAPS_API_KEY is configured (length: ' + apiKey.length + ')');
    } else {
      Logger.log('✗ Test 5 FAILED: GOOGLE_MAPS_API_KEY is not configured');
    }
  } catch (e) {
    Logger.log('✗ Test 5 ERROR: ' + e.toString());
  }

  Logger.log('');
  Logger.log('=== Address Lookup API Tests Completed ===');
}

/**
 * Quick test function - just test the basic functionality
 */
function quickTest() {
  Logger.log('Quick Test: Looking up address for zip code 100-0005');
  var result = api_getAddressByZipCode('100-0005');
  Logger.log(result);
}
