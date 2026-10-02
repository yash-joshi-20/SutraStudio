import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_CLIENT = ['/dashboard','/orders','/projects-client','/media','/chat','/invoices','/profile','/client-dashboard','/client-form']
const PROTECTED_ADMIN = ['/admin']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  // Basic role-based path hints; real checks in API/server
  const role = request.cookies.get('role')?.value
  if (PROTECTED_ADMIN.some(p => path.startsWith(p)) && role !== 'admin' && role !== 'superAdmin') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  if (PROTECTED_CLIENT.some(p => path.startsWith(p)) && !role) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*','/admin/:path*','/orders/:path*','/client-dashboard/:path*','/client-form/:path*'],
}
