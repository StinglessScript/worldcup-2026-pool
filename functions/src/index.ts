import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';

// Define secrets
const githubToken = defineSecret('GITHUB_TOKEN');

/**
 * HTTP endpoint to trigger GitHub workflow for score updates
 * Accessible at https://vnworldcup.web.app/update
 */
export const triggerUpdate = onRequest(
  {
    cors: true,
    maxInstances: 1,
    secrets: [githubToken],
  },
  async (req, res) => {
    const GITHUB_TOKEN = githubToken.value();
    const WORKFLOW_URL = 'https://api.github.com/repos/StinglessScript/worldcup-2026-pool/actions/workflows/update-scores.yml/dispatches';

    try {
      const response = await fetch(WORKFLOW_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      });

      if (response.status === 204) {
        res.json({
          success: true,
          message: 'Workflow triggered',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: `GitHub API returned ${response.status}`,
        });
      }
    } catch (error: any) {
      logger.error('Error triggering workflow:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);
