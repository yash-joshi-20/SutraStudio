import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_CLIENT = ['/dashboard','/orders','/projects-client','/media','/chat','/invoices','/profile','/client-dashboard','/client-form']
const PROTECTED_ADMIN = ['/admin']

export function middleware(request: NextRequest) {
  // Let Next.js render client views and RouteGuard handle portal permissions
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/orders/:path*',
    '/projects-client/:path*',
    '/media/:path*',
    '/chat/:path*',
    '/invoices/:path*',
    '/profile/:path*',
    '/client-dashboard/:path*',
    '/client-form/:path*',
  ],
};
