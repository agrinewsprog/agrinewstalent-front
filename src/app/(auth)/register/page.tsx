'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Card, CardBody, CardHeader } from '@/src/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al registrarse');
      }

      // Redirigir a login o directamente a intranet si la API establece la cookie
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
        <p className="text-gray-600 text-center mt-2">
          Únete a AgriNews Talent
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
            type="text"
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

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

          <Select
            label="Tipo de cuenta"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'student', label: 'Estudiante' },
              { value: 'company', label: 'Empresa' },
              { value: 'university', label: 'Universidad' },
            ]}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Crear cuenta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
