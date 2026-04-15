/**
 * Structured logger — replaces all console.log/console.error.
 * In production: JSON lines for log aggregation (Datadog, ELK, etc.)
 * In development: human-readable format with timestamps + levels.
 */

const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function timestamp() {
  return new Date().toISOString();
}

function log(level, label, message, meta = {}) {
  if (levels[level] > levels[LOG_LEVEL]) return;

  const entry = {
    timestamp: timestamp(),
    level: level.toUpperCase(),
    label,
    message,
    ...(Object.keys(meta).length > 0 && { meta }),
  };

  if (process.env.NODE_ENV === 'production') {
    process.stdout.write(JSON.stringify(entry) + '\n');
  } else {
    const metaStr = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : '';
    process.stdout.write(`[${entry.timestamp}] ${level.toUpperCase().padEnd(5)} [${label}] ${message}${metaStr}\n`);
  }
}

module.exports = {
  info:  (label, msg, meta) => log('info',  label, msg, meta),
  warn:  (label, msg, meta) => log('warn',  label, msg, meta),
  error: (label, msg, meta) => log('error', label, msg, meta),
  debug: (label, msg, meta) => log('debug', label, msg, meta),
};