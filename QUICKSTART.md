# 🚀 INICIO RÁPIDO

## 1️⃣ Instalación (YA HECHO)
```bash
npm install  # ✅ Dependencias instaladas (incluyendo clsx)
```

## 2️⃣ Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env y configurar:
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 3️⃣ Iniciar Desarrollo
```bash
npm run dev
```

Abre http://localhost:3000

## 📍 Rutas Disponibles

### Público
- `/` - Landing page
- `/login` - Iniciar sesión
- `/register` - Crear cuenta

### Student (requiere login)
- `/intranet/student/dashboard`
- `/intranet/student/offers`
- `/intranet/student/applications`
- `/intranet/student/profile`
- `/intranet/student/programs`
- `/intranet/student/notifications`

### Company (requiere login)
- `/intranet/company/dashboard`
- `/intranet/company/offers`
- `/intranet/company/applications`
- `/intranet/company/profile`
- `/intranet/company/programs`
- `/intranet/company/promotions`

### University (requiere login)
- `/intranet/university/dashboard`
- `/intranet/university/students`
- `/intranet/university/invites`
- `/intranet/university/programs`
- `/intranet/university/profile`

### Admin (requiere login)
- `/intranet/admin/dashboard`
- `/intranet/admin/users`
- `/intranet/admin/companies`
- `/intranet/admin/universities`
- `/intranet/admin/offers`
- `/intranet/admin/applications`
- `/intranet/admin/promotions`

## ⚠️ IMPORTANTE: API Backend

El frontend requiere que la API backend esté corriendo en la URL configurada.

### Endpoints Necesarios:
```
POST /auth/login       - Login (establece cookie httpOnly)
POST /auth/register    - Registro
POST /auth/logout      - Logout
GET  /auth/me          - Obtener usuario actual (requiere cookie)
GET  /offers           - Listar ofertas
GET  /offers/:id       - Detalle de oferta
```

### Configurar CORS en la API:
```javascript
// En tu backend (Express ejemplo)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true  // IMPORTANTE para cookies
}));
```

## 🔧 Troubleshooting

### Error: Cannot find module '@/src/...'
```bash
# Asegurarse de que tsconfig.json tiene:
"paths": {
  "@/*": ["./*"],
  "@/src/*": ["./src/*"]
}
```

### Login no funciona
1. Verificar que `NEXT_PUBLIC_API_URL` está configurado
2. Verificar que la API backend está corriendo
3. Verificar CORS en la API (credentials: true)
4. Ver console del navegador para errores

### Middleware redirige mal
Ver archivo `src/middleware.ts` y verificar que la API responde correctamente en `/auth/me`

## 📚 Archivos Clave

- `src/middleware.ts` - Autenticación y redirección
- `src/lib/api/client.ts` - Cliente API
- `src/lib/auth/session.ts` - Gestión de sesión
- `src/types/index.ts` - Tipos TypeScript
- `SCAFFOLD_README.md` - Documentación completa

## ✅ Checklist Antes de Empezar

- [ ] API backend corriendo
- [ ] .env configurado con NEXT_PUBLIC_API_URL
- [ ] CORS configurado en la API con credentials: true
- [ ] Endpoints de autenticación implementados en la API
- [ ] npm install ejecutado
- [ ] npm run dev funcionando

## 🎯 Próximo Paso

1. Asegurar que la API backend esté lista
2. Crear un usuario de prueba en cada rol
3. Probar el flujo de login
4. Verificar que el middleware redirige correctamente
5. Empezar a implementar las funcionalidades específicas

---

**¿Listo? Ejecuta:**
```bash
npm run dev
```

Y visita http://localhost:3000 🚀
