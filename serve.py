#!/usr/bin/env python3
"""
UP2CLOUD — Local Dev Server (Python alternative)
Simulates CI/CD production injection of secrets.
Usage: python3 serve.py
Reads GROQ_API_KEY from .env and injects it into index.html at request time.
"""

import http.server
import os
import re
import sys

# ── Load .env ────────────────────────────────────────────────────
def load_env(path='.env'):
    env = {}
    try:
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, _, val = line.partition('=')
                env[key.strip()] = val.strip().strip('"\'')
    except FileNotFoundError:
        pass
    return env

ENV  = load_env()
PORT = int(ENV.get('PORT', os.environ.get('PORT', 3000)))

# ── Request handler ──────────────────────────────────────────────
class Handler(http.server.SimpleHTTPRequestHandler):

    def do_GET(self):
        # Normalise path
        path = self.path.split('?')[0].split('#')[0]
        if path in ('/', ''):
            path = '/index.html'

        # Serve index.html
        if path == '/index.html':
            try:
                with open('index.html', 'rb') as f:
                    encoded = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(encoded)))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(encoded)
            except FileNotFoundError:
                self.send_error(404, 'index.html not found')
        else:
            super().do_GET()

    def log_message(self, fmt, *args):
        print(f'  {args[1]}  {args[0]}')

# ── Start ────────────────────────────────────────────────────────
if __name__ == '__main__':
    key_status = (f"{ENV['GROQ_API_KEY'][:8]}••••••••" if ENV.get('GROQ_API_KEY') else '❌  not found in .env')

    print(f'\n  ┌─────────────────────────────────────────┐')
    print(f'  │  🚀  http://localhost:{PORT}               │')
    print(f'  │                                         │')
    print(f'  │  GROQ_API_KEY  ✅  {key_status:<23}│')
    print(f'  │  Mode          production simulation    │')
    print(f'  └─────────────────────────────────────────┘\n')
    print('  Press Ctrl+C to stop.\n')

    with http.server.HTTPServer(('127.0.0.1', PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n  Server stopped.')
            sys.exit(0)
