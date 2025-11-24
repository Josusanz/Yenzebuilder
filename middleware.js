// Vercel Edge Middleware
// This runs before the request reaches the file system

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // If accessing builder.yenze.io at root, rewrite to builder.html
  if (hostname === 'builder.yenze.io' && url.pathname === '/') {
    url.pathname = '/builder.html';
    return Response.rewrite(url);
  }

  // Continue with normal request
  return Response.next();
}

export const config = {
  matcher: '/',
};
