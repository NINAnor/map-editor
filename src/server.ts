#!/usr/bin/env -S deno run --allow-net --allow-env=PORT
/// <reference lib="deno.ns" />
import * as z from 'zod';
import { buildOpenApiSpec, buildSchema, validateConfig } from './map-config.ts';

const port = Number(Deno.env.get('PORT') ?? 8080);

const SWAGGER_UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Nina Maps API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui', deepLinking: true });
  </script>
</body>
</html>`;

Deno.serve({ port }, async req => {
  const { pathname } = new URL(req.url);

  if (pathname === '/api/schema' && req.method === 'GET') {
    return Response.json(buildSchema());
  }

  if (pathname === '/api/openapi.json' && req.method === 'GET') {
    return Response.json(buildOpenApiSpec());
  }

  if (pathname === '/api/docs' && req.method === 'GET') {
    return new Response(SWAGGER_UI_HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  if (pathname === '/api/validate' && req.method === 'POST') {
    let data: unknown;
    try {
      data = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const result = validateConfig(data);
    if (result.success) {
      return Response.json({ valid: true });
    }
    return Response.json({ valid: false, errors: z.treeifyError(result.error) }, { status: 422 });
  }

  return new Response('Not Found', { status: 404 });
});
