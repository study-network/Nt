export async function onRequest(context) {
  const req = context.request;
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });
  }

  try {
    const urlParams = new URL(req.url).searchParams;
    const urlToShorten = urlParams.get('url');

    if (!urlToShorten) {
      return new Response(JSON.stringify({ status: 'error', message: 'URL required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const token = 'bb0082e0ede156f2a39bf274f943aa567155b660';
    const apiCall = `https://vplink.in/api?api=${token}&url=${encodeURIComponent(urlToShorten)}`;
    
    const fetchRes = await fetch(apiCall);
    const data = await fetchRes.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
