/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated rate limiting service
 */

const requestCounts = new Map();

/**
 * Rate limit check
 * @param {string} identifier - IP address or user ID
 * @param {number} limit - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - true if allowed, false if rate limited
 */
export function rateLimit(identifier, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier) || [];
  
  // Filter out requests outside the time window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
  
  // Check if limit exceeded
  if (recentRequests.length >= limit) {
    return false;
  }
  
  // Add current request
  recentRequests.push(now);
  requestCounts.set(identifier, recentRequests);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupOldEntries(windowMs);
  }
  
  return true;
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(identifier, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier) || [];
  const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
  return Math.max(0, limit - recentRequests.length);
}

/**
 * Reset rate limit for identifier
 */
export function resetRateLimit(identifier) {
  requestCounts.delete(identifier);
}

/**
 * Cleanup old entries
 */
function cleanupOldEntries(windowMs) {
  const now = Date.now();
  for (const [identifier, timestamps] of requestCounts.entries()) {
    const recentRequests = timestamps.filter(timestamp => now - timestamp < windowMs);
    if (recentRequests.length === 0) {
      requestCounts.delete(identifier);
    } else {
      requestCounts.set(identifier, recentRequests);
    }
  }
}

