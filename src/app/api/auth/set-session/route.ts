import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/set-session
 * Recibe { token } desde el cliente y lo guarda en una cookie
 * httpOnly para que el servidor pueda leerla en getSession().
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token: string = body?.token ?? '';

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // 8 horas
      maxAge: 60 * 60 * 8,
      // secure solo en producción
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 });
  }
}
