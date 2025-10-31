// Version information for Scrylytics
// This helps users verify they're using the latest version

export const VERSION = '1.2.0';
export const BUILD_DATE = new Date().toISOString().split('T')[0];
export const FEATURES = [
  'AI-powered deck analysis',
  'Hearthstone & Magic support',
  'Card images and visuals',
  'Branch protection',
  'Automated deployments'
];

export function getVersionInfo() {
  return {
    version: VERSION,
    buildDate: BUILD_DATE,
    features: FEATURES,
    lastCommit: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    environment: process.env.NODE_ENV || 'development'
  };
}
