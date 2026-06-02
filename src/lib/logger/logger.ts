type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, metadata?: unknown) {
  console[level](
    JSON.stringify({
      timestamp: new Date().toISOString(),

      level,

      message,

      metadata,
    }),
  );
}
