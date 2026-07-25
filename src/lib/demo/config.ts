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

/**
 * Is this the public demo account?
 *
 * Drives the affordances a curious visitor needs and a real organizer does not:
 * a way back to the marketing site, a reminder of the credentials, the
 * creation guard. Never true on a deployment where the demo is off.
 */
export function isDemoUser(user: { email?: string } | null | undefined): boolean {
  if (!isDemoEnabled() || !user?.email) return false
  const demoEmail = process.env.DEMO_EMAIL?.trim() || 'demo@cancha.be'
  return user.email.trim().toLowerCase() === demoEmail.toLowerCase()
}
