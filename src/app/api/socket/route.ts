import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response('WebSocket endpoint - use WebSocket connection', {
    status: 200,
  });
}