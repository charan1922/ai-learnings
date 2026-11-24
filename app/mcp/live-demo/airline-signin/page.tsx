import { AirlineSignInForm } from '@/components/mcp-demo/features/elicitation/airline-signin-form'

/** /mcp/live-demo/airline-signin?eid=… — the page a URL-mode elicitation opens. */
export default async function AirlineSignInPage({ searchParams }: PageProps<'/mcp/live-demo/airline-signin'>) {
  const { eid } = await searchParams
  return <AirlineSignInForm eid={typeof eid === 'string' ? eid : undefined} />
}
