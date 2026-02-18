# FASE 2: UI de Ofertas y Postulaciones - Implementación Completa

## 📋 Resumen

Se han implementado todas las funcionalidades de la FASE 2 para la gestión de ofertas y aplicaciones, tanto para estudiantes como para empresas.

---

## 🎯 Componentes Creados

### 1. **OffersList** (`src/components/offers/offers-list.tsx`)
Lista de ofertas con filtros y acciones.

**Características:**
- ✅ Búsqueda por texto (título, descripción, empresa)
- ✅ Filtro por tipo de contrato (full-time, part-time, internship, freelance)
- ✅ Filtro por ubicación
- ✅ Botón "Aplicar" para enviar aplicación
- ✅ Botón "Guardar" para marcar ofertas favoritas (⭐)
- ✅ Display de información clave (ubicación, salario, fecha)
- ✅ Contador de resultados

**Props:**
```typescript
interface OffersListProps {
  offers: Offer[];
  onApply?: (offerId: string) => void;
  onSave?: (offerId: string) => void;
  savedOffers?: string[];
}
```

---

### 2. **ApplicationsList** (`src/components/applications/applications-list.tsx`)
Lista de aplicaciones con información contextual.

**Características:**
- ✅ Vista adaptable (mostrar oferta o estudiante según contexto)
- ✅ Badges de estado con colores semánticos
- ✅ Vista de carta de presentación
- ✅ Selector de estado (solo para empresas con `onStatusChange`)
- ✅ Enlaces a detalles

**Props:**
```typescript
interface ApplicationsListProps {
  applications: Application[];
  showOffer?: boolean;      // Para vista de estudiante
  showStudent?: boolean;    // Para vista de empresa
  onStatusChange?: (applicationId: string, status: Application['status']) => void;
}
```

---

### 3. **OfferForm** (`src/components/offers/offer-form.tsx`)
Formulario de creación y edición de ofertas.

**Características:**
- ✅ Validación de campos obligatorios
- ✅ Vista previa de errores en tiempo real
- ✅ Campos: título, descripción, ubicación, tipo, salario (opcional), estado
- ✅ Manejo de loading state
- ✅ Botón cancelar

**Props:**
```typescript
interface OfferFormProps {
  offer?: Offer;  // Si existe, modo edición
  onSubmit: (data: OfferFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface OfferFormData {
  title: string;
  description: string;
  location: string;
  type: Offer['type'];
  salary?: string;
  status: Offer['status'];
}
```

---

### 4. **ApplicationTimeline** (`src/components/applications/application-timeline.tsx`)
Timeline visual del historial de una aplicación.

**Características:**
- ✅ Visualización cronológica de cambios de estado
- ✅ Indicadores de color por estado
- ✅ Display de notas asociadas a cada cambio
- ✅ Formato de fecha legible en español

**Props:**
```typescript
interface ApplicationTimelineProps {
  timeline: ApplicationTimeline[];
}
```

---

## 👨‍🎓 Funcionalidades para STUDENT

### Páginas Actualizadas

#### 1. `/intranet/student/offers` (Lista de ofertas)
- **Archivo:** `src/app/intranet/student/offers/page.tsx`
- **Client Component:** `page.client.tsx`
- **Funcionalidades:**
  - Ver todas las ofertas publicadas
  - Filtrar por tipo, ubicación y búsqueda
  - Aplicar a oferta (abre modal con carta de presentación)
  - Guardar ofertas como favoritas
  - Redirección a detalles

#### 2. `/intranet/student/offers/[id]` (Detalle de oferta)
- **Archivo:** `src/app/intranet/student/offers/[id]/page.tsx`
- **Client Component:** `apply-button.tsx`
- **Funcionalidades:**
  - Ver detalles completos de la oferta
  - Botón "Aplicar" con modal
  - Campo opcional para carta de presentación
  - Validación y manejo de errores
  - Redirección a aplicaciones tras aplicar

#### 3. `/intranet/student/applications` (Mis aplicaciones)
- **Archivo:** `src/app/intranet/student/applications/page.tsx`
- **Funcionalidades:**
  - Ver todas las aplicaciones enviadas
  - Estado visual (badge con colores)
  - Información de la oferta aplicada
  - Link a detalles de cada aplicación

#### 4. `/intranet/student/applications/[id]` (Detalle de aplicación)
- **Archivo:** `src/app/intranet/student/applications/[id]/page.tsx`
- **Funcionalidades:**
  - Ver información completa de la aplicación
  - Ver carta de presentación enviada
  - Timeline completo de cambios de estado
  - Notas de la empresa (si las hay)

---

## 🏢 Funcionalidades para COMPANY

### Páginas Actualizadas

#### 1. `/intranet/company/offers` (Mis ofertas)
- **Archivo:** `src/app/intranet/company/offers/page.tsx`
- **Funcionalidades:**
  - Listar todas las ofertas de la empresa
  - Ver estado (draft, published, closed)
  - Botón "Nueva oferta"
  - Botón "Editar" por cada oferta
  - Badge visual por estado

#### 2. `/intranet/company/offers/new` (Crear oferta)
- **Archivo:** `src/app/intranet/company/offers/new/page.tsx`
- **Funcionalidades:**
  - Formulario de creación de oferta
  - Validación de campos
  - Redirección tras guardar

#### 3. `/intranet/company/offers/[id]/edit` (Editar oferta)
- **Archivos:** 
  - `page.tsx` (server component)
  - `edit-client.tsx` (client component)
- **Funcionalidades:**
  - Cargar oferta existente
  - Formulario pre-rellenado
  - Actualización en tiempo real
  - Redirección tras guardar

#### 4. `/intranet/company/applications` (Candidaturas)
- **Archivo:** `src/app/intranet/company/applications/page.tsx`
- **Client Component:** `applications-list-company.tsx`
- **Funcionalidades:**
  - Ver todas las aplicaciones recibidas
  - Cambiar estado desde la lista (dropdown)
  - Ver información del estudiante
  - Link a detalles

#### 5. `/intranet/company/applications/[id]` (Detalle de candidatura)
- **Archivo:** `src/app/intranet/company/applications/[id]/page.tsx`
- **Client Component:** `application-actions.tsx`
- **Funcionalidades:**
  - Ver perfil del candidato
  - Ver carta de presentación
  - Cambiar estado de la aplicación
  - Añadir notas privadas
  - Ver timeline completo
  - Actualización optimista del estado

---

## 🔌 Endpoints de API Requeridos

### Para ESTUDIANTES

```typescript
// Obtener todas las ofertas publicadas
GET /offers
Response: { data: Offer[] }

// Obtener detalle de oferta
GET /offers/:id
Response: { data: Offer }

// Crear aplicación
POST /applications
Body: { offerId: string, coverLetter?: string }
Response: { data: Application }

// Obtener aplicaciones del estudiante
GET /applications/my
Response: { data: Application[] }

// Obtener detalle de aplicación
GET /applications/:id
Response: { data: Application }

// Guardar oferta como favorita
POST /saved-offers
Body: { offerId: string }
Response: { success: boolean }

// Eliminar oferta de favoritas
DELETE /saved-offers/:offerId
Response: { success: boolean }

// Obtener ofertas guardadas
GET /saved-offers
Response: { data: string[] }  // Array de offerIds
```

### Para EMPRESAS

```typescript
// Obtener ofertas de la empresa
GET /offers/my
Response: { data: Offer[] }

// Crear oferta
POST /offers
Body: OfferFormData
Response: { data: Offer }

// Actualizar oferta
PUT /offers/:id
Body: OfferFormData
Response: { data: Offer }

// Eliminar oferta (opcional)
DELETE /offers/:id
Response: { success: boolean }

// Obtener aplicaciones a ofertas de la empresa
GET /applications/company
Response: { data: Application[] }

// Obtener detalle de aplicación
GET /applications/:id
Response: { data: Application }

// Cambiar estado de aplicación
PATCH /applications/:id/status
Body: { status: Application['status'], note?: string }
Response: { data: Application }

// Añadir nota a aplicación
POST /applications/:id/notes
Body: { note: string }
Response: { data: Application }
```

---

## 📦 Estructura de Datos

### Offer
```typescript
interface Offer {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'freelance';
  salary?: string;
  status: 'draft' | 'published' | 'closed';
  company?: Company;
  createdAt: string;
  updatedAt: string;
}
```

### Application
```typescript
interface Application {
  id: string;
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  coverLetter?: string;
  offer?: Offer;
  student?: Student;
  timeline?: ApplicationTimeline[];
  createdAt: string;
  updatedAt: string;
}
```

### ApplicationTimeline
```typescript
interface ApplicationTimeline {
  id: string;
  status: Application['status'];
  note?: string;
  createdAt: string;
}
```

---

## 🎨 Mejoras UX Implementadas

1. **Filtros en tiempo real** - Búsqueda y filtrado instantáneo sin recargar
2. **Estados visuales** - Badges con colores semánticos para estados
3. **Loading states** - Botones con indicador de carga
4. **Toasts** - Notificaciones de éxito/error usando `useToast()`
5. **Modales** - Para confirmaciones (aplicar a oferta)
6. **Optimistic updates** - Actualización UI antes de respuesta del servidor
7. **Empty states** - Mensajes y CTAs cuando no hay datos
8. **Validación de formularios** - Errores en tiempo real
9. **Timeline visual** - Historial gráfico de estados
10. **Responsive design** - Grid adaptable a móviles

---

## 🚀 Cómo Probar

### 1. Como ESTUDIANTE

```bash
# Navegar a ofertas
http://localhost:3000/intranet/student/offers

# Acciones:
1. Filtrar ofertas por tipo/ubicación
2. Buscar por texto
3. Guardar una oferta (⭐)
4. Aplicar a una oferta
5. Ver mis aplicaciones
6. Ver detalle con timeline
```

### 2. Como EMPRESA

```bash
# Navegar a ofertas
http://localhost:3000/intranet/company/offers

# Acciones:
1. Crear nueva oferta
2. Editar oferta existente
3. Ver aplicaciones recibidas
4. Cambiar estado de candidatura
5. Añadir notas a candidatos
6. Ver timeline de aplicación
```

---

## 🔧 Próximos Pasos (Backend)

Para que todo funcione, el backend debe:

1. **Implementar todos los endpoints** listados arriba
2. **Validar permisos:**
   - Estudiantes solo ven ofertas publicadas
   - Empresas solo gestionan sus ofertas
   - Empresas solo ven aplicaciones a sus ofertas
3. **Populate relations:**
   - Incluir `offer.company` en respuestas de ofertas
   - Incluir `application.offer` y `application.student` en aplicaciones
   - Incluir `application.timeline` ordenado por fecha
4. **Manejar estados:**
   - Solo permitir transiciones de estado válidas
   - Crear timeline entry cada vez que cambia el estado
5. **Gestionar saved offers:**
   - Tabla intermedia `student_saved_offers`
   - Devolver lista de IDs guardados

---

## ✅ Checklist de Implementación

### Componentes Reutilizables
- [x] OffersList con filtros
- [x] ApplicationsList adaptable
- [x] OfferForm con validación
- [x] ApplicationTimeline visual

### Estudiante
- [x] Lista de ofertas con filtros
- [x] Guardar ofertas favoritas
- [x] Aplicar a oferta con carta
- [x] Ver aplicaciones enviadas  - [x] Detalle con timeline

### Empresa
- [x] CRUD completo de ofertas
- [x] Ver candidaturas recibidas
- [x] Cambiar estado de aplicaciones
- [x] Añadir notas a candidatos
- [x] Timeline de aplicaciones

### Conectividad API
- [x] Integración con API client
- [x] Manejo de errores
- [x] Loading states
- [x] Toasts de feedback

---

## 🎯 Estado Actual

**FASE 2 COMPLETADA** ✅

Todos los componentes y páginas están implementados y listos para conectar con el backend API.

