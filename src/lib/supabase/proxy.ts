import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Pass through — no auth calls in the proxy.
  // Auth is handled by:
  //   - /auth/callback route (exchanges PKCE code, sets cookies)
  //   - Browser client (reads session from cookies via createBrowserClient)
  // Making network calls here (getUser, getClaims, getSession) blocks every
  // page load when Supabase is slow or unreachable.
  return NextResponse.next({ request })
}
