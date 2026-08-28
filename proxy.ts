import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed `middleware` -> `proxy`. This runs before every
// /admin request.
//
// IMPORTANT — this is NOT the auth check. Firebase Auth keeps its session
// in the browser's IndexedDB, which is unreachable from server code here,
// so the proxy cannot know who (or whether) someone is signed in. The
// real RBAC gate is client-side in app/admin/(dashboard)/layout.tsx
// (role read from Firestore) and enforced for real by firestore.rules on
// every read/write. Wiring a server-verifiable check would need the
// Firebase Admin SDK minting a `__session` cookie — a follow-up.
//
// What the proxy does do: keep the authenticated admin area out of caches
// and out of search indexes.
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: "/admin/:path*",
};
