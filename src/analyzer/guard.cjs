// CI Guard for Deck Analyzer
// Safely short-circuits analyzer operations in CI environments to prevent hangs

const isCI = process.env.CI === 'true' ||
             process.env.CONTINUOUS_INTEGRATION === 'true' ||
             process.env.BUILD_NUMBER ||
             process.env.CIRCLECI ||
             process.env.GITHUB_ACTIONS === 'true' ||
             process.env.DECK_ANALYZER_MODE === 'off';

const shouldSkipAnalysis = isCI || process.env.DECK_ANALYZER_MODE === 'off';

module.exports = {
  isCI,
  shouldSkipAnalysis,
  guard: function(operation, fallback = null) {
    if (shouldSkipAnalysis) {
      console.log(`🔇 Analyzer ${operation} skipped in CI/safe mode`);
      return fallback || { skipped: true, reason: 'ci_mode' };
    }
    return null; // Continue with normal operation
  },
  requireGuard: function(operation) {
    if (shouldSkipAnalysis) {
      throw new Error(`Analyzer ${operation} blocked in CI/safe mode`);
    }
  }
};