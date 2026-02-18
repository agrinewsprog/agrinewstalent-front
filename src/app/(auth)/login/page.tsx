'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Importante para recibir cookies
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // La cookie httpOnly se establece automáticamente
      // Redirigir a intranet (el middleware redirigirá al dashboard correcto)
      router.push('/intranet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>
        <p className="text-gray-600 text-center mt-2">
          Accede a tu cuenta de AgriNews Talent
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Input
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Recordarme</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Iniciar sesión
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
