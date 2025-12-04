// Cloudflare Worker for GitHub OAuth with Sveltia/Decap CMS
// Deploy this to Cloudflare Workers to enable CMS authentication

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers for CMS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Start OAuth flow: /auth?provider=github&site_id=...&scope=...
    if (url.pathname === '/auth') {
      const provider = url.searchParams.get('provider');
      const scope = url.searchParams.get('scope') || 'repo,user';

      if (provider !== 'github') {
        return new Response('Only GitHub provider is supported', { status: 400 });
      }

      // Redirect to GitHub OAuth
      const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
      githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      githubAuthUrl.searchParams.set('scope', scope);
      githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);

      return Response.redirect(githubAuthUrl.toString(), 302);
    }

    // Handle OAuth callback: /callback?code=...
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');

      if (!code) {
        return new Response('No code provided', { status: 400 });
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(`GitHub OAuth error: ${tokenData.error_description}`, { status: 400 });
      }

      // Return success page that sends token to CMS
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authenticating...</title>
</head>
<body>
  <h1>Authentication successful!</h1>
  <p>Redirecting back to CMS...</p>
  <script>
    (function() {
      const data = {
        token: "${tokenData.access_token}",
        provider: "github"
      };

      function receiveMessage(e) {
        console.log("Received message from:", e.origin);
        window.opener.postMessage(
          "authorization:github:success:" + JSON.stringify(data),
          e.origin
        );
      }

      window.addEventListener("message", receiveMessage, false);

      // Post message to opener
      console.log("Posting token to opener");
      window.opener.postMessage(
        "authorization:github:success:" + JSON.stringify(data),
        "*"
      );

      setTimeout(function() {
        window.close();
      }, 1000);
    })();
  </script>
</body>
</html>`;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          ...corsHeaders,
        },
      });
    }

    // Default response
    return new Response('OAuth Gateway for Sveltia CMS - Endpoints: /auth, /callback', {
      headers: corsHeaders,
    });
  }
};
