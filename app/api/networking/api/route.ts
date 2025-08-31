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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, url: rawUrl, data, headers = {} } = body;

    if (!method || !rawUrl) {
      return NextResponse.json({
        error: 'Method and URL are required'
      }, { status: 400 });
    }

    const url = normalizeUrl(rawUrl);

    const requestHeaders = {
      'User-Agent': 'zk-terminal/1.0',
      'Content-Type': 'application/json',
      ...headers,
    };

    const requestOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: requestHeaders,
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);

    const responseHeaders = Object.fromEntries(response.headers.entries());
    const contentType = response.headers.get('content-type') || '';

    let responseBody;
    try {
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
    } catch (parseError) {
      responseBody = await response.text();
    }

    return NextResponse.json({
      success: true,
      method: method.toUpperCase(),
      url,
      status: response.status,
      statusText: response.statusText,
      contentType,
      headers: responseHeaders,
      data: responseBody
    });
  } catch (error) {
    return NextResponse.json({
      error: `API request failed: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
}
