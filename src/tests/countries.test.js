const { testAPI, checkPerformance } = require('../utils/api-client');
const { generateJSONReport } = require('../utils/reporter');
const config = require('../config/test-config');

// Store all test results
const allResults = [];

describe('REST Countries API Tests', () => {
  
  test('should get all countries', async () => {
    // Use fields parameter to get all data
    const result = await testAPI({
      name: 'Get All Countries',
      url: `${config.baseURL}/all?fields=name,cca2,cca3,population,capital,region,subregion,area,currencies,languages`,
      method: 'GET',
      expectedStatus: 200,
      maxResponseTime: config.performance.maxResponseTime,
      validateResponse: (data) => {
        // Check that we got countries
        if (!Array.isArray(data)) {
          return 'Response should be an array';
        }
        
        if (data.length === 0) {
          return 'Response should contain at least one country';
        }
        
        // Validate first country has required fields
        const firstCountry = data[0];
        if (!firstCountry.name || !firstCountry.name.common) {
          return 'Country should have name.common field';
        }
        
        return true;
      },
    });
    
    allResults.push(result);
    expect(result.status).toBe('PASS');
    expect(result.statusCode).toBe(200);
  });

  test('should get country by name', async () => {
    const result = await testAPI({
      name: 'Get Country by Name (Israel)',
      url: `${config.baseURL}/name/israel`,
      method: 'GET',
      expectedStatus: 200,
      maxResponseTime: config.performance.maxResponseTime,
      validateResponse: (data) => {
        if (!Array.isArray(data)) {
          return 'Response should be an array';
        }
        
        if (data.length === 0) {
          return 'Response should contain at least one country';
        }
        
        // Check that Israel is in the results
        const israel = data.find(c => 
          c.name && c.name.common && c.name.common.toLowerCase() === 'israel'
        );
        if (!israel) {
          return 'Israel not found in results';
        }
        
        return true;
      },
    });
    
    allResults.push(result);
    expect(result.status).toBe('PASS');
  });

  test('should get country by code', async () => {
    const result = await testAPI({
      name: 'Get Country by Code (IL)',
      url: `${config.baseURL}/alpha/il`,
      method: 'GET',
      expectedStatus: 200,
      maxResponseTime: config.performance.maxResponseTime,
      validateResponse: (data) => {
        // API returns array even for single country
        const country = Array.isArray(data) ? data[0] : data;
        
        if (!country || typeof country !== 'object') {
          return 'Response should be a country object';
        }
        
        if (!country.name || !country.name.common) {
          return 'Country should have name.common field';
        }
        
        if (country.cca2 && country.cca2 !== 'IL') {
          return `Expected country code IL, got ${country.cca2}`;
        }
        
        return true;
      },
    });
    
    allResults.push(result);
    expect(result.status).toBe('PASS');
  });

  test('should handle invalid country name', async () => {
    const result = await testAPI({
      name: 'Handle Invalid Country Name',
      url: `${config.baseURL}/name/nonexistentcountry12345`,
      method: 'GET',
      expectedStatus: 404,
      maxResponseTime: config.performance.maxResponseTime,
    });
    
    allResults.push(result);
    // This should pass because 404 is expected
    expect(result.status).toBe('PASS');
    expect(result.statusCode).toBe(404);
  });

  test('should get countries by region', async () => {
    const result = await testAPI({
      name: 'Get Countries by Region (Europe)',
      url: `${config.baseURL}/region/europe`,
      method: 'GET',
      expectedStatus: 200,
      maxResponseTime: config.performance.maxResponseTime,
      validateResponse: (data) => {
        if (!Array.isArray(data)) {
          return 'Response should be an array';
        }
        
        if (data.length === 0) {
          return 'Response should contain at least one country';
        }
        
        // Check that all countries are from Europe
        const allEuropean = data.every(c => c.region === 'Europe');
        if (!allEuropean) {
          return 'Not all countries are from Europe';
        }
        
        return true;
      },
    });
    
    allResults.push(result);
    expect(result.status).toBe('PASS');
  });

  test('should check API performance', async () => {
    const result = await checkPerformance({
      url: `${config.baseURL}/all?fields=name,cca2`,
      method: 'GET',
      iterations: 5,
      maxTime: config.performance.maxResponseTime,
    });
    
    allResults.push(result);
    expect(result.passed).toBe(true);
    expect(result.averageTime).toBeLessThanOrEqual(config.performance.maxResponseTime);
  });

});

// Generate JSON report after all tests
afterAll(async () => {
  if (allResults.length > 0) {
    await generateJSONReport(allResults, `countries-api-report-${Date.now()}.json`);
  }
});

