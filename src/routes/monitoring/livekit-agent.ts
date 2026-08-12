import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { isProd } from '../../env.js';

const HEARTBEAT_FILE = '/var/lib/hupo/aisales-livekit-heartbeats.json';
const MAX_HEARTBEATS = 100;
const HEARTBEAT_INTERVAL = 30; // seconds (must match Python service)
const ALERT_THRESHOLD = HEARTBEAT_INTERVAL * 5; // 5x interval = 150 seconds

// Analyze recent heartbeats for failure patterns
function analyzeRecentFailures(recentHeartbeats: any[]) {
  let initializationFailures = 0;
  let runtimeFailures = 0;
  let successfulSessions = 0;

  for (const heartbeat of recentHeartbeats) {
    if (heartbeat.last_session) {
      if (heartbeat.last_session.success) {
        successfulSessions++;
      } else if (heartbeat.last_session.error) {
        // Check if error indicates initialization failure
        const error = heartbeat.last_session.error.toLowerCase();
        if (
          error.includes('[initialization]') ||
          error.includes('api key') ||
          error.includes('credentials') ||
          error.includes('model') ||
          error.includes('connection refused') ||
          error.includes('auth')
        ) {
          initializationFailures++;
        } else if (
          error.includes('[runtime]') ||
          error.includes('network') ||
          error.includes('timeout') ||
          error.includes('disconnected')
        ) {
          runtimeFailures++;
        } else {
          // Unknown failure type, assume runtime
          runtimeFailures++;
        }
      }
    }
  }

  return {
    initializationFailures,
    runtimeFailures,
    successfulSessions,
  };
}

// Ensure directory exists
async function ensureDirectory() {
  const dir = path.dirname(HEARTBEAT_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    // Verify the directory was created and is writable
    await fs.access(dir, fs.constants.W_OK);
  } catch (error: any) {
    // Only throw if it's not an "already exists" error
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to ensure directory ${dir}: ${error.message}`);
    }
  }
}

// Read heartbeats from file
async function readHeartbeats(): Promise<any[]> {
  try {
    const data = await fs.readFile(HEARTBEAT_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.heartbeats || [];
  } catch (error: any) {
    // File doesn't exist or is invalid, return empty array
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

// Write heartbeats to file (atomic write with fallback)
async function writeHeartbeats(heartbeats: any[]) {
  await ensureDirectory();
  const tempFile = HEARTBEAT_FILE + '.tmp';
  const data = JSON.stringify({ heartbeats }, null, 2);

  try {
    // Write to temp file
    await fs.writeFile(tempFile, data, 'utf-8');

    // Verify temp file was created
    await fs.access(tempFile, fs.constants.F_OK);

    // Atomic rename
    await fs.rename(tempFile, HEARTBEAT_FILE);
  } catch (error: any) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempFile);
    } catch {
      // Ignore cleanup errors
    }

    // If atomic write failed, try direct write as fallback
    if (error.code === 'ENOENT' || error.code === 'EACCES') {
      try {
        await fs.writeFile(HEARTBEAT_FILE, data, 'utf-8');
        return; // Success with fallback
      } catch (fallbackError: any) {
        throw new Error(
          `Failed to write heartbeats (tried both atomic and direct write): ${fallbackError.message}`,
        );
      }
    }

    throw error;
  }
}

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Heartbeat receiver endpoint
  app.post('/livekit-agent/heartbeat', {
    schema: {
      body: z.object({
        timestamp: z.string(),
        memory_percent: z.number(),
        cpu_percent: z.number(),
        environment: z.string(),
        agent_name: z.string().optional(),
        // Session health metrics
        last_session: z
          .object({
            timestamp: z.string(),
            success: z.boolean(),
            error: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
        recent_sessions: z
          .object({
            total: z.number(),
            successful: z.number(),
            failed: z.number(),
          })
          .optional(),
        consecutive_failures: z.number().optional(),
      }),
    },
    async handler(request, reply) {
      // Only process heartbeats in production
      if (!isProd) {
        app.log.debug(
          'LiveKit heartbeat received but ignored (non-production environment)',
        );
        return {
          status: 'ignored',
          message: 'Heartbeats are only processed in production environment',
        };
      }

      try {
        const heartbeat = request.body;

        // Read existing heartbeats
        const heartbeats = await readHeartbeats();

        // Add new heartbeat
        heartbeats.push({
          ...heartbeat,
          receivedAt: new Date().toISOString(),
        });

        // Keep only last MAX_HEARTBEATS
        if (heartbeats.length > MAX_HEARTBEATS) {
          heartbeats.splice(0, heartbeats.length - MAX_HEARTBEATS);
        }

        // Write back to file
        await writeHeartbeats(heartbeats);

        const sessionInfo = heartbeat.recent_sessions
          ? `sessions=${heartbeat.recent_sessions.total} (${heartbeat.recent_sessions.successful}✓/${heartbeat.recent_sessions.failed}✗)`
          : 'no sessions yet';

        app.log.debug(
          `LiveKit heartbeat received: ${sessionInfo}, mem=${heartbeat.memory_percent.toFixed(1)}%`,
        );

        return { status: 'ok' };
      } catch (error: any) {
        // Log specific error details for debugging
        const errorDetails = {
          message: error.message,
          code: error.code,
          syscall: error.syscall,
          path: error.path,
          dest: error.dest,
        };
        app.log.error(
          { err: error, errorDetails },
          'Error processing LiveKit heartbeat:',
        );

        // Return more specific error information (but not too detailed for security)
        return reply.code(500).send({
          error: 'Failed to save heartbeat',
          reason:
            error.code === 'ENOENT'
              ? 'File system error'
              : error.code === 'EACCES'
                ? 'Permission error'
                : 'Internal server error',
        });
      }
    },
  });

  // Status check endpoint - returns HTTP status codes for monitoring
  app.get('/livekit-agent/status', {
    schema: {},
    async handler(request, reply) {
      // In non-production environments, return a simple status
      if (!isProd) {
        return reply.code(200).send({
          status: 'disabled',
          message:
            'LiveKit agent monitoring is disabled in non-production environments',
          environment: process.env.NODE_ENV || 'development',
        });
      }

      try {
        const heartbeats = await readHeartbeats();

        if (heartbeats.length === 0) {
          // No heartbeats yet - return 503 Service Unavailable
          return reply.code(503).send({
            status: 'unknown',
            message: 'No heartbeats received yet',
            lastHeartbeat: null,
            metrics: null,
          });
        }

        const lastHeartbeat = heartbeats[heartbeats.length - 1];
        const lastTimestamp = new Date(lastHeartbeat.timestamp);
        const now = new Date();
        const secondsSinceLastHeartbeat = Math.floor(
          (now.getTime() - lastTimestamp.getTime()) / 1000,
        );

        // Evaluate health based on both heartbeat recency AND functional health
        let isHealthy = secondsSinceLastHeartbeat <= ALERT_THRESHOLD;
        let healthReason = isHealthy ? 'heartbeat_recent' : 'heartbeat_stale';

        // Additional functional health checks
        if (isHealthy && lastHeartbeat.consecutive_failures !== undefined) {
          // Check for consecutive failures
          if (lastHeartbeat.consecutive_failures >= 3) {
            isHealthy = false;
            healthReason = 'consecutive_failures';
          }
        }

        // Analyze failure types for more specific health reasons
        if (
          isHealthy &&
          lastHeartbeat.recent_sessions &&
          lastHeartbeat.recent_sessions.total > 0
        ) {
          const recentFailures = analyzeRecentFailures(heartbeats.slice(-5));

          // Check for initialization failure patterns
          if (recentFailures.initializationFailures >= 2) {
            isHealthy = false;
            healthReason = 'initialization_failures';
          }

          // Check for persistent runtime failures
          if (
            recentFailures.runtimeFailures >= 3 &&
            recentFailures.successfulSessions === 0
          ) {
            isHealthy = false;
            healthReason = 'runtime_failures';
          }
        }

        if (isHealthy && lastHeartbeat.recent_sessions) {
          const { total, successful, failed } = lastHeartbeat.recent_sessions;

          // Check error rate if we have enough samples
          if (total >= 5) {
            const errorRate = failed / total;
            if (errorRate > 0.8) {
              isHealthy = false;
              healthReason = 'high_error_rate';
            }
          }

          // Check if last session failed and it was a while ago (persistent failure)
          if (
            lastHeartbeat.last_session &&
            !lastHeartbeat.last_session.success
          ) {
            const lastSessionTime = new Date(
              lastHeartbeat.last_session.timestamp,
            );
            const minutesSinceLastSession =
              (now.getTime() - lastSessionTime.getTime()) / (1000 * 60);

            // If last session failed more than 5 minutes ago and no recovery, consider unhealthy
            if (
              minutesSinceLastSession > 5 &&
              lastHeartbeat.consecutive_failures > 0
            ) {
              isHealthy = false;
              healthReason = 'persistent_failure';
            }
          }
        }

        // Calculate recent averages (last 10 heartbeats)
        const recent = heartbeats.slice(-10);
        const avgMemory =
          recent.reduce((sum, h) => sum + h.memory_percent, 0) / recent.length;
        const avgCpu =
          recent.reduce((sum, h) => sum + h.cpu_percent, 0) / recent.length;

        // Analyze failure patterns for detailed reporting
        const failureAnalysis = analyzeRecentFailures(heartbeats.slice(-10));

        const responseData = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          healthReason,
          lastHeartbeat: {
            timestamp: lastHeartbeat.timestamp,
            receivedAt: lastHeartbeat.receivedAt,
            secondsAgo: secondsSinceLastHeartbeat,
          },
          sessionHealth: {
            lastSession: lastHeartbeat.last_session || null,
            recentSessions: lastHeartbeat.recent_sessions || {
              total: 0,
              successful: 0,
              failed: 0,
            },
            consecutiveFailures: lastHeartbeat.consecutive_failures || 0,
            failureAnalysis: {
              initializationFailures: failureAnalysis.initializationFailures,
              runtimeFailures: failureAnalysis.runtimeFailures,
              successfulSessions: failureAnalysis.successfulSessions,
            },
          },
          systemMetrics: {
            memory_percent: lastHeartbeat.memory_percent,
            cpu_percent: lastHeartbeat.cpu_percent,
            environment: lastHeartbeat.environment,
            agent_name: lastHeartbeat.agent_name,
          },
          averageMetrics: {
            memory_percent: Math.round(avgMemory * 10) / 10,
            cpu_percent: Math.round(avgCpu * 10) / 10,
          },
          thresholds: {
            heartbeatInterval: HEARTBEAT_INTERVAL,
            alertThreshold: ALERT_THRESHOLD,
            maxConsecutiveFailures: 3,
            maxErrorRate: 0.8,
            maxInitializationFailures: 2,
            maxRuntimeFailures: 3,
          },
          totalHeartbeats: heartbeats.length,
        };

        if (isHealthy) {
          // Return 200 OK when healthy
          return reply.code(200).send(responseData);
        } else {
          // Return 503 Service Unavailable when unhealthy
          return reply.code(503).send(responseData);
        }
      } catch (error) {
        app.log.error({ err: error }, 'Error checking LiveKit status:');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  });

  // Debug endpoint to view all heartbeats
  app.get('/livekit-agent/heartbeats', {
    schema: {},
    async handler(request, reply) {
      // In non-production environments, return a simple message
      if (!isProd) {
        return {
          heartbeats: [],
          count: 0,
          maxHeartbeats: MAX_HEARTBEATS,
          message:
            'LiveKit agent monitoring is disabled in non-production environments',
          environment: process.env.NODE_ENV || 'development',
        };
      }

      try {
        const heartbeats = await readHeartbeats();
        return {
          heartbeats,
          count: heartbeats.length,
          maxHeartbeats: MAX_HEARTBEATS,
        };
      } catch (error) {
        app.log.error({ err: error }, 'Error reading LiveKit heartbeats:');
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  });

  app.log.info('[monitoring/livekit-agent.ts] routes registered');
};

export default router;
