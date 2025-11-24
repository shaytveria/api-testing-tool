const axios = require('axios');

/**
 * Send HTTP request and measure performance
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Test result
 */
async function testAPI(options) {
  const {
    url,
    method = 'GET',
    data = null,
    headers = {},
    expectedStatus = 200,
    maxResponseTime = 2000,
    validateResponse = null,
  } = options;

  const startTime = Date.now();
  let result = {
    name: options.name || `${method} ${url}`,
    url,
    method,
    status: 'PENDING',
    responseTime: 0,
    statusCode: null,
    error: null,
    assertions: [],
  };

  try {
    // Send request
    const response = await axios({
      method,
      url,
      data,
      headers,
      timeout: maxResponseTime + 1000, // Add buffer
    });

    const responseTime = Date.now() - startTime;
    result.responseTime = responseTime;
    result.statusCode = response.status;

    // Check status code
    if (response.status === expectedStatus) {
      result.assertions.push({
        name: 'Status Code',
        passed: true,
        expected: expectedStatus,
        actual: response.status,
      });
    } else {
      result.assertions.push({
        name: 'Status Code',
        passed: false,
        expected: expectedStatus,
        actual: response.status,
        error: `Expected ${expectedStatus}, got ${response.status}`,
      });
      result.status = 'FAIL';
      result.error = `Wrong status code: ${response.status}`;
      return result;
    }

    // Check performance (only if status is OK)
    if (responseTime <= maxResponseTime) {
      result.assertions.push({
        name: 'Performance',
        passed: true,
        expected: `<= ${maxResponseTime}ms`,
        actual: `${responseTime}ms`,
      });
    } else {
      result.assertions.push({
        name: 'Performance',
        passed: false,
        expected: `<= ${maxResponseTime}ms`,
        actual: `${responseTime}ms`,
        error: `Response time too slow: ${responseTime}ms`,
      });
      // Don't fail the test just because of performance, only warn
    }

    // Custom validation
    if (validateResponse) {
      try {
        const validationResult = validateResponse(response.data);
        if (validationResult === true) {
          result.assertions.push({
            name: 'Custom Validation',
            passed: true,
          });
        } else {
          result.assertions.push({
            name: 'Custom Validation',
            passed: false,
            error: validationResult || 'Validation failed',
          });
          result.status = 'FAIL';
          result.error = 'Custom validation failed';
          return result;
        }
      } catch (validationError) {
        result.assertions.push({
          name: 'Custom Validation',
          passed: false,
          error: validationError.message,
        });
        result.status = 'FAIL';
        result.error = `Validation error: ${validationError.message}`;
        return result;
      }
    }

    // All checks passed
    result.status = 'PASS';
    result.data = response.data;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    result.responseTime = responseTime;

    if (error.response) {
      // Server responded with error
      result.statusCode = error.response.status;
      
      // Check if the error status code is what we expected
      if (error.response.status === expectedStatus) {
        // This is expected, so it's a PASS
        result.status = 'PASS';
        result.assertions.push({
          name: 'Status Code',
          passed: true,
          expected: expectedStatus,
          actual: error.response.status,
        });
      } else {
        // Unexpected status code
        result.status = 'FAIL';
        result.error = `HTTP ${error.response.status}: ${error.response.statusText}`;
        result.assertions.push({
          name: 'Status Code',
          passed: false,
          expected: expectedStatus,
          actual: error.response.status,
          error: error.response.statusText,
        });
      }
    } else if (error.request) {
      // Request was made but no response
      result.error = 'No response from server';
      result.assertions.push({
        name: 'Network',
        passed: false,
        error: 'No response received',
      });
    } else {
      // Error in request setup
      result.error = error.message;
      result.assertions.push({
        name: 'Request Setup',
        passed: false,
        error: error.message,
      });
    }
  }

  return result;
}

/**
 * Check API performance
 * @param {Object} options - Performance test options
 * @returns {Promise<Object>} Performance result
 */
async function checkPerformance(options) {
  const { url, method = 'GET', iterations = 5, maxTime = 2000 } = options;

  const results = [];
  let totalTime = 0;
  let successCount = 0;

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    try {
      await axios({ method, url, timeout: maxTime + 1000 });
      const responseTime = Date.now() - startTime;
      results.push(responseTime);
      totalTime += responseTime;
      successCount++;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      results.push(responseTime);
      totalTime += responseTime;
    }
  }

  const averageTime = totalTime / iterations;
  const minTime = Math.min(...results);
  const maxResponseTime = Math.max(...results);

  return {
    name: `Performance Test: ${url}`,
    url,
    method,
    status: averageTime <= maxTime ? 'PASS' : 'FAIL',
    iterations,
    successCount,
    averageTime: Math.round(averageTime),
    minTime: Math.round(minTime),
    maxTime: Math.round(maxResponseTime),
    allTimes: results.map(t => Math.round(t)),
    threshold: maxTime,
    passed: averageTime <= maxTime,
  };
}

module.exports = {
  testAPI,
  checkPerformance,
};

