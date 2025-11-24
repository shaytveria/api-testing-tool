const fs = require('fs').promises;
const path = require('path');

/**
 * Generate JSON report from test results
 * @param {Array} results - Array of test results
 * @param {string} filename - Output filename
 */
async function generateJSONReport(results, filename = 'test-report.json') {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  const totalTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0);
  const averageTime = totalTests > 0 ? Math.round(totalTime / totalTests) : 0;

  const report = {
    summary: {
      totalTests,
      passedTests,
      failedTests,
      passRate,
      averageResponseTime: averageTime,
      generatedAt: new Date().toISOString(),
    },
    tests: results.map(result => ({
      name: result.name,
      status: result.status,
      url: result.url,
      method: result.method || null,
      statusCode: result.statusCode || null,
      responseTime: result.responseTime || null,
      assertions: result.assertions || [],
      error: result.error || null,
      ...(result.iterations && {
        performance: {
          iterations: result.iterations,
          successCount: result.successCount,
          averageTime: result.averageTime,
          minTime: result.minTime,
          maxTime: result.maxTime,
          allTimes: result.allTimes,
        }
      })
    }))
  };

  const reportPath = path.join(__dirname, '../../reports/json-reports', filename);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  
  console.log(`\n✅ JSON Report generated: ${reportPath}`);
  return reportPath;
}

module.exports = {
  generateJSONReport,
};
