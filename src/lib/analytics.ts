type EventType = 'profile_view' | 'whatsapp_tap' | 'share_tap' | 'happy_tails_view'
type EventSource = 'qr' | 'direct' | 'social' | 'embed' | 'unknown'

/**
 * Fire-and-forget analytics event.
 * Never awaited — never blocks UI.
 * Silently fails — analytics must never break UX.
 */
export function trackEvent(
  type: EventType,
  animalId: string,
  organizationId: string,
  source: EventSource = 'unknown'
): void {
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, animalId, organizationId, source }),
  }).catch(() => {})
}
