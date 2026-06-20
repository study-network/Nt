export async function onRequest(context) {
  const req = context.request;
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');

    if (!path) {
      return new Response(JSON.stringify({ success: false, message: 'Path required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const targetUrl = new URL(`https://1api.notjitu.workers.dev${path}`);
    
    // Copy all other search params
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        targetUrl.searchParams.append(key, value);
      }
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    headers.set('Origin', 'https://www.notjitu.in');
    headers.set('Referer', 'https://www.notjitu.in/');

    const options = {
      method: req.method,
      headers: headers,
    };

    // Read body completely into memory to prevent Transfer-Encoding: chunked
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      const bodyText = await req.text();
      if (bodyText) {
        options.body = bodyText;
      }
    }

    const fetchRes = await fetch(targetUrl.toString(), options);
    
    // Read the response completely before returning to avoid partial stream failures
    const responseBody = await fetchRes.text();
    
    // Copy response headers and inject CORS
    const responseHeaders = new Headers(fetchRes.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    return new Response(responseBody, {
      status: fetchRes.status,
      statusText: fetchRes.statusText,
      headers: responseHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
