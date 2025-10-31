// guard deck analyzer in CI
if (process.env.DECK_ANALYZER_MODE === 'off' || process.env.CI) {
  console.log('[deck-analyzer] disabled for this build');
  process.exit(0);
}
