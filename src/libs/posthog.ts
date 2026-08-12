import { PostHog } from 'posthog-node';
import { isDev } from '../env.js';

// Singleton PostHog client
let posthogClient: PostHog | null = null;

/**
 * Gets or initializes the PostHog client
 * Using lazy initialization to ensure environment variables are loaded
 */
export function getPostHogClient(): PostHog | null {
  // Return existing client if already initialized
  if (posthogClient !== null) {
    return posthogClient;
  }

  // Check if API key is available
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) {
    console.log('PostHog API key not found. Analytics disabled.');
    return null;
  }

  try {
    // Initialize PostHog client
    posthogClient = new PostHog(apiKey, {
      host: 'https://us.i.posthog.com',
      disabled: isDev,
      flushAt: isDev ? 1 : 20, // Flush more frequently in development
      flushInterval: isDev ? 3000 : 10000, // 3s in dev, 10s in prod
    });

    console.log('PostHog client initialized successfully');
    return posthogClient;
  } catch (error) {
    console.error('Failed to initialize PostHog client:', error);
    return null;
  }
}

/**
 * Safe wrapper for PostHog capture method
 * Will silently fail if PostHog client is not initialized
 */
function capture(params: {
  distinctId: string;
  event: string;
  properties?: Record<string, any>;
}): void {
  const client = getPostHogClient();
  if (client) {
    client.capture(params);
  }
}

/**
 * Safe wrapper for PostHog identify method
 * Will silently fail if PostHog client is not initialized
 */
function identify(params: {
  distinctId: string;
  properties?: Record<string, any>;
}): void {
  const client = getPostHogClient();
  if (client) {
    client.identify(params);
  }
}

/**
 * Safe wrapper for PostHog flush method
 * Will silently fail if PostHog client is not initialized
 */
function flush(): Promise<any> {
  const client = getPostHogClient();
  if (client) {
    return client.flush();
  }
  return Promise.resolve();
}

/**
 * Safe wrapper for PostHog isFeatureEnabled method
 * Will return false if PostHog client is not initialized
 */
async function isFeatureEnabled(params: {
  featureFlag: string;
  distinctId: string;
  personProperties?: Record<string, any>;
}): Promise<boolean> {
  const client = getPostHogClient();
  if (!client) {
    console.log(
      'PostHog client not initialized, feature flag disabled by default',
    );
    return false;
  }

  try {
    const result = await client.isFeatureEnabled(
      params.featureFlag,
      params.distinctId,
      params.personProperties
        ? { personProperties: params.personProperties }
        : undefined,
    );

    if (result === undefined) {
      console.log(
        `Feature flag "${params.featureFlag}" returned undefined for distinctId "${params.distinctId}". ` +
          `Possible reasons: PostHog disabled (isDev=${isDev}), flag doesn't exist, or person not identified.`,
      );
    } else {
      console.log(
        `Feature flag "${params.featureFlag}" for distinctId "${params.distinctId}": ${result}`,
      );
    }

    return result === true;
  } catch (error) {
    console.error(
      `Failed to evaluate feature flag "${params.featureFlag}":`,
      error,
    );
    return false;
  }
}

// Export a safe PostHog interface
export const posthog = {
  capture,
  identify,
  flush,
  isFeatureEnabled,
  // Add more methods as needed
};
