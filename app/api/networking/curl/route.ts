import { NextRequest, NextResponse } from 'next/server';

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
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  const url = normalizeUrl(rawUrl);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'zk-terminal/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    const content = await response.text();

    return NextResponse.json({
      success: true,
      url,
      status: response.status,
      statusText: response.statusText,
      contentType,
      content,
      headers: Object.fromEntries(response.headers.entries())
    });
  } catch (error) {
    return NextResponse.json({
      error: `Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
}
