import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Generate a random nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  
  // Clone the request headers and add the nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Get Formbricks API host from environment variable if available
  const formbricksApiHost = process.env.NEXT_PUBLIC_FORMBRICKS_API_HOST;
  
  // Build style-src directive
  // Allow 'self', nonce for inline styles, and Formbricks domains for external styles
  const styleSrcParts = ["'self'", `'nonce-${nonce}'`];
  
  // Add Formbricks domain if available
  if (formbricksApiHost) {
    try {
      const formbricksOrigin = new URL(formbricksApiHost).origin;
      styleSrcParts.push(formbricksOrigin);
    } catch {
      // Invalid URL, skip
    }
  }
  
  const styleSrc = styleSrcParts.join(" ");

  const csp = `style-src ${styleSrc};`;

  // Create response with CSP header
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

