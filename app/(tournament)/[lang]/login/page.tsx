import { LoginForm } from './login-form'
import { isDemoEnabled } from '@/lib/demo/config'
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo/seed'

export const dynamic = 'force-dynamic'

/**
 * Server wrapper around the client login form: whether this deployment runs the
 * public demo is a server-only flag, so it is resolved here and handed down
 * rather than exposed through a NEXT_PUBLIC_ variable.
 */
export default function ManageLoginPage() {
  const demo = isDemoEnabled() ? { email: DEMO_EMAIL, password: DEMO_PASSWORD } : null
  return <LoginForm demo={demo} />
}
