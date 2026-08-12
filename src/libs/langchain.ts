import { LangChainCallbackHandler } from '@posthog/ai';
import { getPostHogClient } from './posthog.js';

export const callbackHandler = ({
  type,
  userId,
  sessionId,
}: {
  type: string;
  userId: string | undefined;
  sessionId: string;
}) =>
  new LangChainCallbackHandler({
    client: getPostHogClient() as any,
    distinctId: userId || '',
    properties: {
      sessionId,
      type,
    },
  });
