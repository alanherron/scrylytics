// Version API endpoint for Scrylytics
// Returns current version and build information

import { getVersionInfo } from '../../../lib/version.js';

export async function GET() {
  try {
    const versionInfo = getVersionInfo();

    return Response.json({
      success: true,
      ...versionInfo,
      message: 'Scrylytics version information'
    });
  } catch (error) {
    console.error('Version API error:', error);
    return Response.json({
      success: false,
      error: 'Failed to retrieve version information'
    }, { status: 500 });
  }
}
