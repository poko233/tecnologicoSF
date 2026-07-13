# PROMPT PARA CLAUDE CLI — Frontend React Native: Módulo de Convalidación

---

## CONTEXTO DEL PROYECTO

Proyecto React Native con Expo. Ya existe un sistema de temas y un httpClient.
Tu trabajo es crear el módulo de convalidación de materias como un wizard de 5 pasos.

---

## REGLAS OBLIGATORIAS — LEE ESTO PRIMERO

### 1. USA EL httpClient EXISTENTE — NO uses fetch directo ni axios

El proyecto ya tiene `src/services/httpClient.ts` con estos métodos:
- `httpClient.postAuth(path, body)` — POST autenticado con JSON
- `httpClient.getAuth(path)` — GET autenticado
- `httpClient.putAuth(path, body)` — PUT autenticado
- `httpClient.deleteAuth(path)` — DELETE autenticado
- `httpClient.postFormData(path, formData)` — POST multipart para archivos

BASE_URL ya está configurada en el httpClient. Los paths van sin BASE_URL:
✅ `httpClient.getAuth('/api/carreras')`
❌ `fetch('http://...../api/carreras')`

### 2. USA EL SISTEMA DE TEMAS EXISTENTE — NO uses colores hardcodeados

El proyecto ya tiene `src/theme/themes.ts` con lightTheme, darkTheme, premiumTheme.
Usa siempre `useTheme()` hook y `theme.colors.X` para todos los colores.

Tokens de color disponibles:
```
theme.colors.background          — fondo principal
theme.colors.backgroundSecondary — fondo de cards/secciones
theme.colors.backgroundTertiary  — fondo de inputs
theme.colors.text                — texto principal
theme.colors.textSecondary       — texto secundario
theme.colors.textTertiary        — texto terciario
theme.colors.textMuted           — texto muy tenue
theme.colors.primary             — rojo institucional (#D32F2F light / #EF4444 dark)
theme.colors.primarySubtle       — fondo sutil del primario
theme.colors.success             — verde (#10B981)
theme.colors.warning             — amarillo (#F59E0B)
theme.colors.destructive         — rojo error
theme.colors.info                — azul (#3B82F6)
theme.colors.card                — fondo de tarjetas
theme.colors.border              — bordes
theme.colors.inputBorder         — borde de inputs
theme.colors.input               — fondo de inputs
theme.colors.muted               — texto muted
```

### 3. DISEÑO VISUAL — Replica exactamente el diseño de las imágenes

El tema de las imágenes es DARK (fondo oscuro #1E293B / #0F172A).
El componente debe verse así en dark mode exactamente como las imágenes.

---

## DISEÑO VISUAL DETALLADO (de las imágenes)

### Header (igual en todos los pasos)
- Título: "Solicitud de convalidación" — texto blanco, bold, tamaño 18
- Subtítulo: "Gestión académica · Universidad Cochabamba" — texto gris claro, tamaño 13
- Badge código en esquina derecha: "SOL-2024-0089" — fondo azul (#3B82F6), texto blanco, borderRadius 8, padding 6x12

### Stepper (igual en todos los pasos)
- 5 círculos numerados conectados por líneas
- Paso COMPLETADO: círculo verde (#10B981) con número blanco + label verde abajo
- Paso ACTIVO: círculo azul (#3B82F6) con número blanco + label azul abajo, bold
- Paso PENDIENTE: círculo gris oscuro con número gris + label gris abajo
- Labels: "Datos del estudiante", "Documentos", "Materias", "Pago", "Resolución"
- Línea conectora: gris entre pendientes, verde entre completados

### Botones de navegación
- "← Anterior": botón outline, borde gris, texto gris, padding 14x20, borderRadius 10
- "Siguiente →": botón filled, fondo azul (#3B82F6), texto blanco, padding 14x20, borderRadius 10
- "Generar reporte ↗": botón filled, fondo azul, texto blanco (solo en paso 5)
- Ambos al fondo de la pantalla, flex row, space-between

---

## PASO 1 — Datos del estudiante

### Diseño (ver imagen 2)
- Sección con label "DATOS DEL ESTUDIANTE" en texto muted uppercase pequeño
- Grid 2 columnas de campos readonly (no editables, solo display):
  - Nº DE MATRÍCULA / C.I.
  - NOMBRE COMPLETO / FECHA DE INSCRIPCIÓN
  - INSTITUCIÓN DE ORIGEN / CARRERA DE ORIGEN
  - CARRERA DESTINO / SEMESTRE VIGENTE
- MOTIVO DE LA SOLICITUD: campo full width
- Cada campo: label pequeño gris arriba, valor en input-like box (fondo backgroundSecondary, borde border, borderRadius 8, padding 12)
- Botón "Siguiente →" abajo a la derecha

### Campos del formulario (estos SÍ son editables para ingresar datos nuevos)
El paso 1 es para REGISTRAR un estudiante nuevo. Campos:
```
// Datos personales
ci: string (requerido)
expedido: select — LPZ | CBBA | OR | PT | TJ | SCZ | BN | PD | CH | QR | EXT
nombres: string (requerido)
apellidoPaterno: string (requerido)
apellidoMaterno: string (opcional)
genero: select — MASCULINO | FEMENINO
fecha_nac: DatePicker (requerido)
email: string email (opcional)
telefono: string (opcional)
celular: string (opcional)
direccion: string (opcional)

// Matrícula
matricula: string (requerido) — formato MAT-YYYY-XXXXX

// Solicitud
idCarreraDestino: select — carga de GET /api/carreras
idGestion: select — carga de GET /api/gestiones  
tipo: select — externa | cambio_carrera
institucion_origen: string (requerido)
carrera_origen_nombre: string (requerido)
motivo: textarea (opcional)
```

### Llamadas API del paso 1
```typescript
// Al montar: cargar selects
GET /api/carreras          → lista de carreras para idCarreraDestino
GET /api/gestiones         → lista de gestiones para idGestion

// Al presionar Siguiente
POST /api/convalidacion/solicitudes
Body: { ci, expedido, nombres, apellidoPaterno, apellidoMaterno, genero,
        fecha_nac, email, telefono, celular, direccion, matricula,
        idCarreraDestino, idGestion, tipo, institucion_origen,
        carrera_origen_nombre, motivo }
Response: { success: true, data: { id, codigo, idUsuario, idCarreraDestino, ... } }
→ Guardar el id y codigo de la solicitud en estado global/context
→ Avanzar a paso 2
```

---

## PASO 2 — Documentos

### Diseño (ver imagen 3)
- Título de sección "DOCUMENTOS REQUERIDOS" uppercase muted
- Grid 2 columnas de cards de documentos
- Cada card:
  - Badge "Obligatorio" (rojo) o "Opcional" (verde) en esquina superior derecha
  - Ícono del tipo de documento (izquierda arriba)
  - Nombre del documento en bold
  - Descripción en texto pequeño gris
  - Si YA subido: fila verde con ✓ nombre_archivo.pdf y tamaño (842 KB)
  - Si NO subido: botón dashed "↑ Subir imagen o PDF" (fondo transparente, borde dashed gris)
- Alerta naranja al fondo si falta algún obligatorio:
  "⚠ Falta 1 documento obligatorio. No se puede avanzar..."
- Botones Anterior / Siguiente al fondo

### Tipos de documentos (hardcodeados en el frontend)
```typescript
const DOCUMENTOS_REQUERIDOS = [
  {
    tipo: 'certificado_notas',
    nombre: 'Certificado de notas',
    descripcion: 'Notas originales de la institución de origen, con sello y firma del secretario académico.',
    obligatorio: true,
    accept: 'pdf,jpg,jpeg,png',
    icono: 'document-text'
  },
  {
    tipo: 'constancia_institucional',
    nombre: 'Constancia institucional',
    descripcion: 'Documento que acredita la institución de origen: resolución ministerial o código SIE.',
    obligatorio: true,
    accept: 'pdf,jpg,jpeg,png',
    icono: 'business'
  },
  {
    tipo: 'programa_analitico',
    nombre: 'Programa analítico',
    descripcion: 'Sílabo o programa de cada materia a convalidar, con contenido mínimo y carga horaria.',
    obligatorio: true,
    accept: 'pdf,jpg,jpeg,png',
    icono: 'clipboard'
  },
  {
    tipo: 'documento_identidad',
    nombre: 'Documento de identidad',
    descripcion: 'Fotocopia del carnet de identidad vigente del estudiante (anverso y reverso).',
    obligatorio: false,
    accept: 'jpg,jpeg,png',
    icono: 'card'
  }
]
```

### Llamadas API del paso 2
```typescript
// Al montar: ver qué documentos ya subió
GET /api/convalidacion/solicitudes/{id}/documentos
→ Lista de documentos ya subidos con tipo, nombreDocumento, ubicacionArchivo

// Al presionar "Subir"
// Usar expo-document-picker o expo-image-picker
// Luego subir con postFormData:
const formData = new FormData()
formData.append('tipo', tipo)
formData.append('archivo', { uri, name, type } as any)
POST /api/convalidacion/solicitudes/{id}/documentos (postFormData)

// Al presionar X en un documento subido
DELETE /api/convalidacion/solicitudes/{id}/documentos/{docId}

// Validación antes de Siguiente:
// Verificar que todos los obligatorios tengan archivo subido
// Si falta alguno → mostrar alerta naranja y NO avanzar
```

---

## PASO 3 — Materias a convalidar

### Diseño (ver imagen 4)
- Título "MATERIAS A CONVALIDAR" uppercase muted
- Tabla con columnas: MATERIA DE ORIGEN | INSTITUCIÓN | NOTA | CR. | → | MATERIA DESTINO | ESTADO
- Cada fila:
  - Materia origen: texto blanco
  - Institución: texto gris
  - Nota: número en color (verde si ≥60, naranja si <60)
  - Créditos: número blanco
  - Flecha →
  - Materia destino: texto blanco
  - Estado badge: "Aprobada" verde | "Pendiente" amarillo | "Observada" naranja/rojo
- Botón "+ Agregar materia" outline azul abajo de la tabla
- Botones Anterior / Siguiente al fondo

### Modal "Agregar materia"
Al presionar "+ Agregar materia" abrir un BottomSheet o Modal con:
```
materia_origen_nombre: TextInput "Nombre de la materia en origen"
materia_origen_institucion: TextInput "Institución" (pre-llenado con institucion_origen)
nota_origen: TextInput numérico
creditos_origen: TextInput numérico (mostrar como "Cr.")
idMateriaDestino: Select — carga de GET /api/carreras/{idCarreraDestino}/materias
                           muestra nombreMateria + semestre
```
Botones: Cancelar / Agregar

### Llamadas API del paso 3
```typescript
// Al montar: cargar materias destino disponibles y detalles ya agregados
GET /api/carreras/{idCarreraDestino}/materias
→ Lista de materias de la carrera destino para el select

GET /api/convalidacion/solicitudes/{id}/detalles
→ Lista de materias ya agregadas a la solicitud

// Al confirmar en modal
POST /api/convalidacion/solicitudes/{id}/detalles
Body: { materia_origen_nombre, materia_origen_institucion, nota_origen,
        creditos_origen, idMateriaDestino }

// Al presionar X en una fila (eliminar materia)
DELETE /api/convalidacion/solicitudes/{id}/detalles/{detalleId}
```

---

## PASO 4 — Pago

### Diseño (ver imagen 5)
- Título "PAGO POR CONVALIDACIÓN" uppercase muted
- Lista de conceptos (label izquierda, valor derecha):
  - "Materias solicitadas" → "4 materias"
  - "Arancel por materia" → "Bs. 120.00"
  - "Gestión" → "2024 — I"
  - "Descuento traslado interno" → "— Bs. 0.00" (en verde si hay descuento)
- Box destacado "Total a cancelar" con fondo azul (#3B82F6), texto blanco, "Bs. 480.00" grande
- FORMA DE PAGO: Select con opciones:
  "Banco Unión — depósito" | "Pago en caja" | "QR / billetera digital"
  → Mapea a: TRANSFERENCIA | EFECTIVO | QR
- Nº DE COMPROBANTE: TextInput (opcional)
- FECHA DE PAGO: DatePicker
- ESTADO: badge "Pendiente verificación" naranja (readonly)
- Botones Anterior / Siguiente

### Llamadas API del paso 4
```typescript
// Al montar
GET /api/convalidacion/solicitudes/{id}/cuota
→ { monto, cantidad_materias, arancel_por_materia, descuento, estado }
→ Si no existe cuota aún, los valores vienen calculados pero no guardados

// Al presionar Siguiente (crear cuota + registrar pago)
POST /api/convalidacion/solicitudes/{id}/cuota
Body: { arancel_por_materia, descuento, fecha_vencimiento }

POST /api/convalidacion/solicitudes/{id}/pago
Body: { metodo, comprobante, fecha_pago, registrado_por }
→ registrado_por: id del user logueado (leerlo del contexto de auth)
```

---

## PASO 5 — Resolución académica

### Diseño (ver imagen 1)
- Título "RESOLUCIÓN ACADÉMICA" uppercase muted
- Tabla con columnas: MATERIA | CR. | ESTADO
  - Estado badges: "Aprobada" verde | "En revisión" amarillo oscuro | "Observada" rojo
- Sección "OBSERVACIÓN DE LA COMISIÓN":
  TextArea con el texto de la observación (readonly si no es admin)
- Campos en fila: "Nº DE RESOLUCIÓN" / "DOCENTE REVISOR" — ambos readonly display
- Alerta verde al fondo: "✓ Historial académico actualizado: 1 materia acreditada — 4 créditos incorporados."
- Botones: "← Anterior" / "Generar reporte ↗"

### Llamadas API del paso 5
```typescript
// Al montar
GET /api/convalidacion/solicitudes/{id}/resolucion
→ { detalles: [{nombre, creditos, estado, observacion}],
    observacion_resolucion, numero_resolucion, docente_revisor,
    creditos_incorporados, materias_acreditadas }
```

---

## ESTRUCTURA DE ARCHIVOS A CREAR

```
src/
├── modules/convalidacion/
│   ├── ConvalidacionWizard.tsx          — componente principal con el stepper y navegación entre pasos
│   ├── context/ConvalidacionContext.tsx  — estado global del wizard (solicitudId, pasoActual, datos)
│   ├── components/
│   │   ├── StepperConvalidacion.tsx     — el stepper visual de 5 pasos
│   │   ├── ConvalidacionHeader.tsx      — header con título, subtítulo y badge de código
│   │   └── NavegacionPasos.tsx          — botones Anterior / Siguiente
│   ├── steps/
│   │   ├── Paso1DatosEstudiante.tsx
│   │   ├── Paso2Documentos.tsx
│   │   ├── Paso3Materias.tsx
│   │   ├── Paso4Pago.tsx
│   │   └── Paso5Resolucion.tsx
│   ├── hooks/
│   │   ├── useConvalidacion.ts          — hook principal del wizard
│   │   ├── usePaso1.ts
│   │   ├── usePaso2Documentos.ts
│   │   ├── usePaso3Materias.ts
│   │   └── usePaso4Pago.ts
│   └── services/
│       └── convalidacionService.ts      — todas las llamadas API usando httpClient
```

---

## SERVICIO DE API — convalidacionService.ts

```typescript
import { httpClient } from '../../../services/httpClient'

export const convalidacionService = {
  // Paso 1
  getCarreras: () => httpClient.getAuth('/api/carreras'),
  getGestiones: () => httpClient.getAuth('/api/gestiones'),
  crearSolicitud: (data: any) => httpClient.postAuth('/api/convalidacion/solicitudes', data),

  // Paso 2
  getDocumentos: (id: number) =>
    httpClient.getAuth(`/api/convalidacion/solicitudes/${id}/documentos`),
  subirDocumento: (id: number, formData: FormData) =>
    httpClient.postFormData(`/api/convalidacion/solicitudes/${id}/documentos`, formData),
  eliminarDocumento: (id: number, docId: number) =>
    httpClient.deleteAuth(`/api/convalidacion/solicitudes/${id}/documentos/${docId}`),

  // Paso 3
  getMateriasCarrera: (idCarrera: number) =>
    httpClient.getAuth(`/api/carreras/${idCarrera}/materias`),
  getDetalles: (id: number) =>
    httpClient.getAuth(`/api/convalidacion/solicitudes/${id}/detalles`),
  agregarDetalle: (id: number, data: any) =>
    httpClient.postAuth(`/api/convalidacion/solicitudes/${id}/detalles`, data),
  eliminarDetalle: (id: number, detalleId: number) =>
    httpClient.deleteAuth(`/api/convalidacion/solicitudes/${id}/detalles/${detalleId}`),

  // Paso 4
  getCuota: (id: number) =>
    httpClient.getAuth(`/api/convalidacion/solicitudes/${id}/cuota`),
  crearCuota: (id: number, data: any) =>
    httpClient.postAuth(`/api/convalidacion/solicitudes/${id}/cuota`, data),
  registrarPago: (id: number, data: any) =>
    httpClient.postAuth(`/api/convalidacion/solicitudes/${id}/pago`, data),

  // Paso 5
  getResolucion: (id: number) =>
    httpClient.getAuth(`/api/convalidacion/solicitudes/${id}/resolucion`),
}
```

---

## CONTEXT DEL WIZARD — ConvalidacionContext.tsx

```typescript
interface ConvalidacionState {
  pasoActual: number          // 1 a 5
  solicitudId: number | null  // se llena al crear en paso 1
  codigoSolicitud: string     // "SOL-2024-0089"
  idCarreraDestino: number | null
  idUsuario: number | null
  gestionLabel: string        // "2024 — I"
}
```

---

## COMPONENTE STEPPER — StepperConvalidacion.tsx

```typescript
// Props
interface StepperProps {
  pasoActual: number  // 1-5
}

// Pasos
const PASOS = [
  { numero: 1, label: 'Datos del\nestudiante' },
  { numero: 2, label: 'Documentos' },
  { numero: 3, label: 'Materias' },
  { numero: 4, label: 'Pago' },
  { numero: 5, label: 'Resolución' },
]

// Lógica de colores:
// paso < pasoActual → completado → círculo theme.colors.success, label success
// paso === pasoActual → activo → círculo theme.colors.info, label info, bold
// paso > pasoActual → pendiente → círculo theme.colors.backgroundTertiary, label muted
```

---

## INSTRUCCIONES FINALES

1. Crea TODOS los archivos de la estructura indicada.
2. USA SIEMPRE httpClient — nunca fetch directo.
3. USA SIEMPRE theme.colors.X — nunca colores hardcodeados.
4. El diseño visual debe replicar exactamente las imágenes: fondo oscuro, cards con borde, badges de estado con colores, stepper con círculos.
5. Maneja loading states con ActivityIndicator usando theme.colors.primary.
6. Maneja errores mostrando Toast (ya existe react-native-toast-message en el proyecto).
7. Todos los textos de labels en UPPERCASE y color theme.colors.textMuted.
8. Inputs con fondo theme.colors.input, borde theme.colors.inputBorder, borderRadius 8, padding 12.
9. Cards con fondo theme.colors.card, borde theme.colors.border, borderRadius 12, padding 16.
10. Al terminar muestra el listado de todos los archivos creados.