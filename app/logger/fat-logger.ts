import { trace, SpanStatusCode } from "@opentelemetry/api";
import type { ReadableSpan, Span, } from "@opentelemetry/sdk-trace-base";
import { logger } from "./core-logger";

const LOG_DATA_KEY = "__logData";

type LogData = {
    timestamp: string;
    startTime: number;
    [key: string]: any;
};

type ExtendedSpan = Span & ReadableSpan & {
    [LOG_DATA_KEY]?: LogData;
};

export const log = (data: any, scope?: string) => {
    const span = trace.getActiveSpan() as unknown as ExtendedSpan;

    if (!span) {
        throw("No active span found. Ensure OTEL instrumentation is properly configured.");
    }

    if (!span[LOG_DATA_KEY]) {
        span[LOG_DATA_KEY] = {
            timestamp: new Date().toISOString(),
            startTime: performance.now(),
        };

        const originalEnd = span.end;
        span.end = function(endTime?: number) {
            flushLog();
            originalEnd.call(this, endTime);
        };
    }

    const accumulated = span[LOG_DATA_KEY];

    if (scope != null) {
        if (!accumulated[scope]) {
            accumulated[scope] = {};
        }
        Object.assign(accumulated[scope], data);

        const spanAttributes: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            spanAttributes[`${scope}.${key}`] = value;
        }
        span.setAttributes(spanAttributes);
    } else {
        Object.assign(accumulated, data);
        span.setAttributes(data);
    }
};

export const flushLog = () => {
    const span = trace.getActiveSpan() as unknown as ExtendedSpan;

    if (!span) {
        throw("No active span found. Ensure OTEL instrumentation is properly configured.");
    }

    // Accumulated should never be null. We are setting it
    // before we call flushLog.
    const accumulated = span[LOG_DATA_KEY]!;


    const duration_ms = performance.now() - accumulated.startTime;

    const spanContext = span.spanContext();
    const attributes = span.attributes || {};

    const { timestamp, startTime, ...customData } = accumulated;

    let logData: any = {
        timestamp,
        path: attributes["next.route"],
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
        // TODO: Find a way to get Method.
        status_code: attributes["http.status_code"],
        duration_ms,
        ...customData,
    };

    if (span.status.code === SpanStatusCode.ERROR) {
        logData = {
            ...logData,
            exception: span.status.message
        }
        logger.error(logData);
    } else {
        logger.info(logData);
    }
};