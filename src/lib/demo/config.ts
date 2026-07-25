/**
 * The live demo is opt-in per deployment.
 *
 * It publishes working credentials and an open reset endpoint, which is exactly
 * what a public demo needs and exactly what a client deployment must not have.
 * Set DEMO_ENABLED=true only where that is intended.
 */
export function isDemoEnabled(): boolean {
  return process.env.DEMO_ENABLED?.trim().toLowerCase() === 'true'
}
