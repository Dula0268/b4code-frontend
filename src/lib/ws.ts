/**
 * Shared helper for deriving the STOMP broker URL from the configured API base.
 *
 * `NEXT_PUBLIC_API_URL` (e.g. "http://localhost:8080" or "https://api.example.com")
 * is converted to the matching WebSocket scheme ("ws://" for http, "wss://" for
 * https) so guests/staff on a real deployed HTTPS site don't hit a mixed-content
 * block from a hardcoded "ws://localhost:8080".
 */
export function getWsBrokerUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // The broker path lives at the API host root, not under /api — strip it if present.
  const base = apiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

  const wsBase = base.startsWith("https:")
    ? base.replace(/^https:/, "wss:")
    : base.startsWith("http:")
      ? base.replace(/^http:/, "ws:")
      : `ws://${base}`;

  return `${wsBase}/ws/messages/raw`;
}
