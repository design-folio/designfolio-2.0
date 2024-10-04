import { NextResponse } from "next/server";

export default function middleware(request) {
  const { hostname, pathname } = request.nextUrl;
  // Exclude handling for localhost during development
  if (
    hostname === "localhost" ||
    hostname === `beta.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`
  ) {
    return NextResponse.next();
  }

  // Adjust the domain structure checking to include your domain specifics
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;

  // Check if we're on the main domain or a subdomain, excluding 'www'
  if (!hostname.endsWith(baseDomain) || hostname === `www.${baseDomain}`) {
    return NextResponse.next();
  }

  // Extract the full subdomain part of the hostname, excluding 'www'
  const subdomain = hostname.replace(`.${baseDomain}`, "");
  if (subdomain && subdomain !== "www") {
    // Rewrite to the internal path based on the full subdomain
    const newPathname = `/preview/${subdomain}`;
    if (pathname === "/") {
      // Only rewrite if we're at the root, prevent looping on other paths
      return NextResponse.rewrite(new URL(newPathname, request.url));
    }
  }

  return NextResponse.next();
}
