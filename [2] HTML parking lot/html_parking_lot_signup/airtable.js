// Cloudflare Worker - robust Airtable proxy
// Usage: deploy to Cloudflare Workers and set the following Environment Variables (in Dashboard or wrangler):
// AIRTABLE_PERSONAL_ACCESS_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME
// Optionally set ALLOWED_ORIGINS (comma-separated) to restrict CORS, e.g. "https://example.com,https://www.example.com"

export default {
  async fetch(request, env) {
    // Origin whitelist from env (comma-separated) or default to empty
    const allowedOriginsRaw = env.ALLOWED_ORIGINS || '';
    const ALLOWED_ORIGINS = allowedOriginsRaw.split(',').map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin');

    // Base CORS headers (other headers added per-response)
    const baseCors = {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    };

    // Preflight handling
    if (request.method === 'OPTIONS') {
      const headers = { ...baseCors };
      if (origin && ALLOWED_ORIGINS.length > 0 && ALLOWED_ORIGINS.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
      } else if (ALLOWED_ORIGINS.length === 0) {
        // if no whitelist configured, be permissive (or you can change to 'null')
        headers['Access-Control-Allow-Origin'] = '*';
      } else {
        headers['Access-Control-Allow-Origin'] = 'null';
      }
      return new Response(null, { status: 204, headers });
    }

    // Validate required env
    const token = env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
    const baseId = env.AIRTABLE_BASE_ID;
    const tableNameRaw = env.AIRTABLE_TABLE_NAME || 'Sign Up Table';
    if (!token || !baseId) {
      const headers = { ...baseCors, 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' };
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500, headers });
    }

    // Build Airtable URL with encoded table name
    const tableEncoded = encodeURIComponent(tableNameRaw);
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${baseId}/${tableEncoded}`;

    // Only allow GET and POST
    if (request.method !== 'GET' && request.method !== 'POST') {
      const headers = { ...baseCors, 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' };
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
    }

    // Prepare CORS headers for actual responses
    const corsHeaders = { ...baseCors };
    if (origin && ALLOWED_ORIGINS.length > 0 && ALLOWED_ORIGINS.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    } else if (ALLOWED_ORIGINS.length === 0) {
      corsHeaders['Access-Control-Allow-Origin'] = '*';
    } else {
      corsHeaders['Access-Control-Allow-Origin'] = 'null';
    }

    try {
      let airtableResponse;

      if (request.method === 'POST') {
        const contentType = request.headers.get('Content-Type') || '';
        if (!contentType.includes('application/json')) {
          return new Response(JSON.stringify({ error: 'Expected application/json' }), { status: 415, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const body = await request.json(); // e.g. { name, email } or { Name, Email }

        // Map fields: frontend may send lowercase keys; Airtable typically expects Title-cased field names
        const fields = {};
        if (body.name) fields['Name'] = body.name;
        if (body.email) fields['Email'] = body.email;
        if (body.Name) fields['Name'] = body.Name;
        if (body.Email) fields['Email'] = body.Email;

        // Basic validation
        if (!fields['Name'] || !fields['Email']) {
          return new Response(JSON.stringify({ error: 'Missing Name or Email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        airtableResponse = await fetch(AIRTABLE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        });
      } else {
        // GET
        airtableResponse = await fetch(AIRTABLE_API_URL + '?pageSize=50', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      const respText = await airtableResponse.text();
      const respContentType = airtableResponse.headers.get('content-type') || '';

      if (!airtableResponse.ok) {
        let parsed;
        try { parsed = JSON.parse(respText); } catch (e) { parsed = { message: respText }; }
        return new Response(JSON.stringify({ error: 'Airtable error', details: parsed }), { status: airtableResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Success: pass through Airtable JSON
      if (respContentType.includes('application/json')) {
        return new Response(respText, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(respText, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }
};