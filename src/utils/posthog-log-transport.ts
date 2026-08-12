import { SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import build from 'pino-abstract-transport';

const pinoLevelToSeverity: Record<number, SeverityNumber> = {
  10: SeverityNumber.TRACE,
  20: SeverityNumber.DEBUG,
  30: SeverityNumber.INFO,
  40: SeverityNumber.WARN,
  50: SeverityNumber.ERROR,
  60: SeverityNumber.FATAL,
};

const pinoLevelToName: Record<number, string> = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
};

export interface PostHogLogOptions {
  posthogApiKey: string;
  posthogHost: string;
  serviceName?: string;
  serviceVersion?: string;
  environment?: string;
  maxExportBatchSize?: number;
  scheduledDelayMillis?: number;
}

interface PinoLogObject {
  level: number;
  time: number;
  msg?: string;
  pid?: number;
  hostname?: string;
  [key: string]: unknown;
}

function flattenAttributes(
  obj: Record<string, unknown>,
  prefix = '',
  seen = new WeakSet<object>(),
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      continue;
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      result[fullKey] = value;
    } else if (typeof value === 'object') {
      if (seen.has(value as object)) {
        result[fullKey] = '[Circular]';
        continue;
      }
      seen.add(value as object);
      Object.assign(
        result,
        flattenAttributes(value as Record<string, unknown>, fullKey, seen),
      );
    } else {
      result[fullKey] = String(value);
    }
  }

  return result;
}

export interface PostHogLogTransport {
  stream: ReturnType<typeof build>;
  close: () => Promise<void>;
}

export async function createPostHogLogStream(
  opts: PostHogLogOptions,
): Promise<PostHogLogTransport> {
  const exporter = new OTLPLogExporter({
    url: `${opts.posthogHost}/i/v1/logs`,
    headers: {
      Authorization: `Bearer ${opts.posthogApiKey}`,
    },
  });

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: opts.serviceName || 'aisales-backend',
    [ATTR_SERVICE_VERSION]: opts.serviceVersion || '1.0.0',
    'deployment.environment':
      opts.environment || process.env.NODE_ENV || 'development',
  });

  const processor = new BatchLogRecordProcessor(exporter, {
    maxExportBatchSize: opts.maxExportBatchSize ?? 50,
    scheduledDelayMillis: opts.scheduledDelayMillis ?? 5000,
  });

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [processor],
  });

  const logger = loggerProvider.getLogger('aisales-backend');

  const close = async () => {
    await loggerProvider.forceFlush();
    await loggerProvider.shutdown();
  };

  const stream = build(
    async function (source) {
      for await (const obj of source) {
        try {
          const {
            level,
            time,
            msg,
            pid: _pid,
            hostname: _hostname,
            ...rest
          } = obj as PinoLogObject;

          logger.emit({
            severityNumber: pinoLevelToSeverity[level] || SeverityNumber.INFO,
            severityText: pinoLevelToName[level] || 'INFO',
            body: msg || JSON.stringify(rest),
            timestamp: time ? new Date(time) : new Date(),
            attributes: flattenAttributes(rest),
          });
        } catch (err) {
          console.error('PostHog log transport: failed to emit log entry', err);
        }
      }
    },
    {
      async close() {
        await close();
      },
    },
  );

  return { stream, close };
}
