// Configuration for API Testing

module.exports = {
  // Base URL for REST Countries API
  baseURL: 'https://restcountries.com/v3.1',
  
  // Performance thresholds
  performance: {
    maxResponseTime: 2000, // 2 seconds in milliseconds
    acceptableResponseTime: 1000, // 1 second
  },
  
  // Test data
  testData: {
    validCountries: ['israel', 'usa', 'france', 'germany', 'japan'],
    invalidCountries: ['nonexistentcountry123', ''],
    countryCodes: ['il', 'us', 'fr', 'de', 'jp'],
    regions: ['europe', 'asia', 'americas', 'africa', 'oceania'],
  },
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
  },
};

