import { NextResponse } from "next/server";

export async function middleware(request) {
  const { hostname, pathname } = request.nextUrl;

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Skip for localhost and beta.<domain>
  if (hostname === "localhost" || hostname === `beta.${baseDomain}`) {
    return NextResponse.next();
  }

  // Case 1: Subdomain under base domain (e.g., client.localhost)
  if (hostname.endsWith(baseDomain) && hostname !== `www.${baseDomain}`) {
    const subdomain = hostname.replace(`.${baseDomain}`, "");

    if (subdomain && subdomain !== "www" && pathname === "/") {
      return NextResponse.rewrite(
        new URL(`/preview/${subdomain}`, request.url)
      );
    }
  }

  // Case 2: Custom domain (e.g., hello.gurkeerat.com)
  try {
    const apiUrl = `${baseUrl}/user/getDomainDetails?domain=${hostname}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      const data = await response.json();

      if (data?.success && data?.username && pathname === "/") {
        return NextResponse.rewrite(
          new URL(`/preview/${data.username}`, request.url)
        );
      }
    }
  } catch (error) {
    console.error("Failed to fetch domain details:", error);
  }

  return NextResponse.next();
}
