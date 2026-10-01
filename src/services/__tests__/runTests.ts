import { runAuthUnitTests } from './auth.test';
import { runDatabaseUnitTests } from './database.test';

console.log('==============================================');
console.log('🧪 RUNNING SPOTLIGHT CORE TEST SUITE');
console.log('==============================================\n');

const authSuite = runAuthUnitTests();
console.log('--- AUTHENTICATION LOGIC SUITE ---');
authSuite.results.forEach((r) => console.log(r));
console.log(`Auth Summary: ${authSuite.passed} passed, ${authSuite.failed} failed\n`);

const dbSuite = runDatabaseUnitTests();
console.log('--- DATABASE & REAL-TIME LOGIC SUITE ---');
dbSuite.results.forEach((r) => console.log(r));
console.log(`Database Summary: ${dbSuite.passed} passed, ${dbSuite.failed} failed\n`);

const totalPassed = authSuite.passed + dbSuite.passed;
const totalFailed = authSuite.failed + dbSuite.failed;

console.log('==============================================');
console.log(`🎯 TOTAL RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log('==============================================');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
