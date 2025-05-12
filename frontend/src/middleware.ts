import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Set security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // For API routes, add additional CORS headers
  if (pathname.startsWith('/api/')) {
    // Determine allowed origins based on environment
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://weatherwizard.vercel.app'] // Replace with your production domain
      : ['http://localhost:3000'];
    
    // Extract origin from request
    const origin = request.headers.get('origin') || '';
    
    // Set CORS headers if origin is allowed
    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
    
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }
  }
  
  return response;
}

// Only apply middleware to API routes
export const config = {
  matcher: '/api/:path*',
};
