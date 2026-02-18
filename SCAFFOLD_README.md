# AgriNews Talent - Frontend

Plataforma de empleo para el sector agrícola con web pública e intranet por roles.

## 🚀 Stack Tecnológico

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS 4**
- **Server Components** por defecto

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (public)/          # Rutas públicas (landing, SEO)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/            # Autenticación (login, registro)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── register/
│   ├── intranet/          # Panel protegido
│   │   ├── layout.tsx
│   │   ├── page.tsx       # Redirige según rol
│   │   ├── student/       # Panel estudiantes
│   │   ├── company/       # Panel empresas
│   │   ├── university/    # Panel universidades
│   │   └── admin/         # Panel administración
│   ├── layout.tsx         # Layout raíz
│   └── globals.css
├── components/
│   ├── ui/                # Componentes UI base
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── modal.tsx
│   └── intranet/          # Componentes de intranet
│       ├── sidebar.tsx
│       ├── topbar.tsx
│       └── role-guard.tsx
├── lib/
│   ├── api/
│   │   └── client.ts      # Cliente API con fetch wrapper
│   ├── auth/
│   │   └── session.ts     # Funciones de sesión
│   └── utils.ts           # Utilidades generales
├── hooks/
│   ├── use-me.ts          # Hook usuario actual
│   └── use-toast.ts       # Hook notificaciones
├── types/
│   └── index.ts           # Tipos TypeScript
└── middleware.ts          # Middleware autenticación/roles
```

## 🔐 Autenticación

- **No usa NextAuth**
- Autenticación basada en **cookies httpOnly** desde la API backend
- El middleware valida la sesión en cada request
- Redirección automática según rol del usuario

## 🎯 Roles del Sistema

| Rol | Dashboard | Funcionalidades |
|-----|-----------|-----------------|
| **student** | `/intranet/student/dashboard` | Ofertas, aplicaciones, programas, perfil |
| **company** | `/intranet/company/dashboard` | Gestión ofertas, aplicaciones, promociones |
| **university** | `/intranet/university/dashboard` | Estudiantes, programas, invitaciones |
| **admin** | `/intranet/admin/dashboard` | Gestión completa del sistema |

## ⚙️ Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar la URL de la API
# Edita .env y establece:
# NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🏃 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

## 🔧 Middleware

El middleware (`src/middleware.ts`) se encarga de:

1. Validar sesión llamando a `/auth/me` en la API
2. Redireccionar a `/login` si no hay sesión
3. Redireccionar al dashboard correcto según el rol
4. Bloquear acceso a rutas de otros roles

## 📡 Cliente API

El cliente API (`src/lib/api/client.ts`) proporciona:

```typescript
import { api } from '@/src/lib/api/client';

// GET
const offers = await api.get<OffersResponse>('/offers');

// POST
const newOffer = await api.post('/offers', { title: '...' });

// PUT
await api.put(`/offers/${id}`, { title: '...' });

// DELETE
await api.delete(`/offers/${id}`);
```

## 🎨 Componentes UI

Todos los componentes UI están en `src/components/ui/`:

```typescript
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardBody } from '@/src/components/ui/card';

<Button variant="primary" size="lg">Click me</Button>
<Input label="Email" type="email" />
```

## 📝 Ejemplo: Crear una nueva página

```typescript
// src/app/intranet/student/nueva-pagina/page.tsx
import { getSession } from '@/src/lib/auth/session';
import { Card, CardBody } from '@/src/components/ui/card';

export default async function NuevaPagina() {
  const user = await getSession(); // Server Component
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nueva Página</h1>
      <Card>
        <CardBody>
          <p>Hola, {user?.name}</p>
        </CardBody>
      </Card>
    </div>
  );
}
```

## 📝 Ejemplo: Llamada a API desde Server Component

```typescript
import { api } from '@/src/lib/api/client';
import { Offer } from '@/src/types';

async function getOffers() {
  try {
    const response = await api.get<{ data: Offer[] }>('/offers');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export default async function OffersPage() {
  const offers = await getOffers();
  
  return (
    <div>
      {offers.map(offer => (
        <div key={offer.id}>{offer.title}</div>
      ))}
    </div>
  );
}
```

## 🔐 Ejemplo: Proteger una ruta por rol

El middleware ya protege las rutas automáticamente. Si necesitas validación adicional:

```typescript
import { requireRole } from '@/src/lib/auth/session';

export default async function SensitivePage() {
  // Solo admins pueden acceder
  await requireRole(['admin']);
  
  return <div>Contenido sensible</div>;
}
```

## 🚀 Build de Producción

```bash
# Crear build
npm run build

# Iniciar servidor de producción
npm start
```

## 📂 Próximos Pasos

1. Conectar con tu API backend
2. Implementar formularios de creación/edición
3. Añadir validación de formularios (react-hook-form + zod)
4. Implementar sistema de notificaciones toast
5. Añadir loading states y error boundaries
6. Implementar paginación en listados
7. Añadir filtros y búsqueda

## 📝 Notas Importantes

- ✅ Server Components por defecto
- ✅ Tipado estricto en TypeScript
- ✅ Cookies httpOnly para autenticación
- ✅ Middleware para protección de rutas
- ✅ Estructura escalable por roles
- ✅ Componentes UI reutilizables
- ⚠️ La API debe estar corriendo para que funcione el login
- ⚠️ Configurar CORS en la API para permitir cookies

## 🐛 Troubleshooting

### El login no funciona
- Verifica que `NEXT_PUBLIC_API_URL` esté configurado correctamente
- Asegúrate de que la API backend esté corriendo
- Verifica que la API permita CORS con credentials

### Middleware redirige incorrectamente
- Verifica que la API responda correctamente en `/auth/me`
- Asegúrate de que las cookies se estén enviando (credentials: 'include')

### Errores de TypeScript
- Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
- Verifica que `@/src/*` esté configurado en `tsconfig.json`

---

**Desarrollado con ❤️ para el sector agrícola**
