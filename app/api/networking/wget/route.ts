import { NextRequest, NextResponse } from "next/server";

// Helper function to normalize URLs
function normalizeUrl(url: string): string {
  // If URL already has a protocol, return as-is
  if (url.match(/^https?:\/\//i) || url.match(/^wss?:\/\//i)) {
    return url;
  }

  // If it's localhost or an IP address, default to http
  if (url.match(/^localhost(:|$)/) || url.match(/^\d+\.\d+\.\d+\.\d+(:|$)/)) {
    return `http://${url}`;
  }

  // For all other URLs, default to https
  return `https://${url}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  const url = normalizeUrl(rawUrl);
  console.log(`API: Fetching URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; zk-terminal/1.0; +https://github.com/p55d2k/zk-terminal)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow", // Follow redirects
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log(`API: Response status: ${response.status}`);
    console.log(`API: Response URL: ${response.url}`);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const contentLength = response.headers.get("content-length") || "unknown";
    const content = await response.text();

    console.log(`API: Content type: ${contentType}`);
    console.log(`API: Content length: ${contentLength}`);
    console.log(`API: Content preview: ${content.substring(0, 200)}`);

    return NextResponse.json({
      success: true,
      url: response.url, // Use the final URL after redirects
      status: response.status,
      statusText: response.statusText,
      contentType,
      contentLength,
      content,
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (error) {
    console.error(`API: Error fetching ${url}:`, error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { error: `Request timeout for ${url}` },
          { status: 408 }
        );
      }
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED")
      ) {
        return NextResponse.json(
          { error: `Host not found or connection refused: ${url}` },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: `Failed to download ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
