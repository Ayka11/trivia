const { runHighValueChecks } = require('./check-utils');

async function main() {
  const uid = process.env.CHECK_UID || process.argv[2];
  const sessionId = process.env.CHECK_SESSION_ID || process.argv[3] || null;

  if (!uid) {
    throw new Error('Usage: node scripts/high-value-checks.js <uid> [sessionId]');
  }

  const report = await runHighValueChecks({ uid, sessionId });
  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
