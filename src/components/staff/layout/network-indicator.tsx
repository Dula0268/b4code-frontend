"use client";

import { ConnectionStatusBadge } from "./connection-status";

/**
 * Header pill showing connection state AND data freshness.
 *
 * The implementation lives in connection-status.tsx (shared with the persistent
 * banner); this file stays as the stable import used by the staff header.
 */
export default function NetworkIndicator() {
  return <ConnectionStatusBadge />;
}
