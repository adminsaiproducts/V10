# Google Maps API Setup Guide

This guide explains how to set up Google Maps API for the address lookup feature in CRM V9 System.

## Prerequisites

- Google Cloud Console access
- CRM V9 System GAS project access

## Setup Steps

### 1. Enable Google Maps Geocoding API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **CRM AppSheet V7** (`crm-appsheet-v7`)
3. Navigate to: **APIs & Services** → **Library**
4. Search for: **Geocoding API**
5. Click **Enable**

### 2. Create API Key (if not exists)

1. Navigate to: **APIs & Services** → **Credentials**
2. Click: **Create Credentials** → **API Key**
3. Copy the API key (e.g., `AIzaSyAYUikfoE-EUb187g-5ZemY-P4ZfdMQzlw`)

### 3. Configure API Key Restrictions

For security, restrict the API key to specific referrers:

1. Click on the API key to edit
2. Under **Application restrictions**:
   - Select: **HTTP referrers (websites)**
3. Add the following referrers:
   ```
   https://script.google.com/*
   https://script.googleusercontent.com/*
   ```
4. Under **API restrictions**:
   - Select: **Restrict key**
   - Enable: **Geocoding API**
5. Click **Save**

### 4. Set Script Properties in GAS

1. Open **CRM V9 System** in GAS Editor
2. Click: **プロジェクトの設定** (⚙️ icon)
3. Scroll to: **スクリプト プロパティ**
4. Add the following property:
   - Property: `GOOGLE_MAPS_API_KEY`
   - Value: `[Your API Key]`
5. Click **Save**

## Testing

After setup, run the test function to verify:

1. Open `test_address_lookup.gs` in GAS Editor
2. Run function: `testAddressLookupAPIs`
3. Check execution logs

Expected results:
- ✅ Test 1: Zip code → Address lookup
- ✅ Test 2: Address → Zip code lookup
- ✅ Test 3: Error handling for invalid input
- ✅ Test 4: Handling null parameters
- ✅ Test 5: API key configuration check

## API Usage

### Zip Code → Address Lookup

Uses **Zipcloud API** (free, no key required):

```javascript
function api_getAddressByZipCode(zipCode) {
  // Returns: { status: 'success', data: [{prefecture, city, address1}] }
}
```

Example:
```javascript
api_getAddressByZipCode('100-0005')
// Returns: 東京都千代田区丸の内
```

### Address → Zip Code Lookup

Uses **Google Maps Geocoding API** (requires GOOGLE_MAPS_API_KEY):

```javascript
function api_getZipCodeByAddress(prefecture, city, address1) {
  // Returns: { status: 'success', data: '1006701' }
}
```

Example:
```javascript
api_getZipCodeByAddress('東京都', '千代田区', '丸の内1-9-1')
// Returns: 1006701
```

## Troubleshooting

### Error: "REQUEST_DENIED"

**Cause**: Geocoding API is not enabled

**Solution**: Follow step 1 to enable the API

### Error: "API key not found"

**Cause**: GOOGLE_MAPS_API_KEY not set in Script Properties

**Solution**: Follow step 4 to set the property

### Error: "Referer not allowed"

**Cause**: API key restrictions are too strict

**Solution**: Add script.google.com and script.googleusercontent.com to HTTP referrers

## Cost Information

- **Zipcloud API**: Free, unlimited
- **Google Maps Geocoding API**:
  - First $200/month free (≈40,000 requests)
  - After: $5 per 1,000 requests

For CRM usage with moderate address lookups, the free tier should be sufficient.

## Related Files

- `AddressLookup.gs` - Backend API implementation
- `test_address_lookup.gs` - Test functions
- `diagnose_google_maps.gs` - Diagnostic tool

## Completed Setup

✅ **Date**: 2025-12-02
✅ **Project**: CRM V9 System
✅ **API Key**: Configured and tested
✅ **Geocoding API**: Enabled
✅ **Test Results**: All 5 tests passed
