import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function buildAuthHeaders(cookieStore: Awaited<ReturnType<typeof cookies>>): Record<string, string> {
  const token =
    cookieStore.get('access_token')?.value ??
    cookieStore.get('accessToken')?.value ??
    cookieStore.get('token')?.value ??
    '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** GET /api/notifications?limit=N  →  proxy to backend */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';

  try {
    const res = await fetch(`${API_URL}/api/notifications?limit=${encodeURIComponent(limit)}`, {
      method: 'GET',
      headers: buildAuthHeaders(cookieStore),
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ data: [] }, { status: res.status });
    }

    const body = await res.json();
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ data: [] }, { status: 502 });
  }
}

/** POST /api/notifications  →  proxy to backend (create notification) */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/api/notifications`, {
      method: 'POST',
      headers: buildAuthHeaders(cookieStore),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: text || `Backend error ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to reach backend' }, { status: 502 });
  }
}
