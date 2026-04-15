import { NextResponse } from 'next/server'

export function middleware(request) {
  const session = request.cookies.get('app_session')
  const isAuth = session?.value === 'authenticated'
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!isAuth && !isLoginPage && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] }
