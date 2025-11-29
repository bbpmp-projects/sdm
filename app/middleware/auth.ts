// app/middleware/auth.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Cek token di localStorage tidak bisa di middleware, jadi kita handle di client side
  // Middleware ini untuk proteksi route dasar
  const token = request.cookies.get('token')?.value
  
  // Jika tidak ada token dan mencoba akses dashboard, redirect ke login
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Jika ada token dan mencoba akses login/register, redirect ke dashboard
  if (token && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard', '/register']
}