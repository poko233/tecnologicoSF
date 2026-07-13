# Módulo de Convalidación de Materias

Wizard de 5 pasos para gestionar solicitudes de convalidación de materias con React Native y Expo.

## Características

- ✅ Wizard de 5 pasos con stepper visual
- ✅ Formulario completo de datos del estudiante
- ✅ Sistema de carga de documentos con validación
- ✅ Gestión de materias a convalidar con modal
- ✅ Cálculo automático de pagos
- ✅ Vista de resolución académica
- ✅ Uso exclusivo de `httpClient` (sin fetch directo)
- ✅ Tema dinámico (light/dark) con `useTheme()`
- ✅ TypeScript con tipos completos
- ✅ Validación de formularios
- ✅ Manejo de errores con Toast

## Estructura

```
screens/convalidacion/
├── ConvalidacionWizard.tsx       # Componente principal
├── context/
│   └── ConvalidacionContext.tsx  # Estado global del wizard
├── components/
│   ├── ConvalidacionHeader.tsx   # Header con título y código
│   ├── StepperConvalidacion.tsx  # Stepper de 5 pasos
│   └── NavegacionPasos.tsx       # Botones de navegación
├── steps/
│   ├── Paso1DatosEstudiante.tsx  # Formulario de datos
│   ├── Paso2Documentos.tsx       # Carga de documentos
│   ├── Paso3Materias.tsx         # Tabla y modal de materias
│   ├── Paso4Pago.tsx             # Resumen y registro de pago
│   └── Paso5Resolucion.tsx       # Resolución final
├── hooks/
│   ├── usePaso1.ts               # Lógica Paso 1
│   ├── usePaso2Documentos.ts     # Lógica Paso 2
│   ├── usePaso3Materias.ts       # Lógica Paso 3
│   └── usePaso4Pago.ts           # Lógica Paso 4
├── services/
│   └── convalidacionService.ts   # API calls con httpClient
└── types/
    └── index.ts                  # Tipos TypeScript
```

## Uso

```tsx
import { ConvalidacionWizard } from '@/screens/convalidacion';

export default function ConvalidacionRoute() {
  return <ConvalidacionWizard />;
}
```

## Flujo del Wizard

### Paso 1: Datos del Estudiante
- Datos personales (CI, nombres, apellidos, género, fecha de nacimiento)
- Datos de contacto (email, teléfono, celular, dirección)
- Matrícula
- Carrera destino y gestión
- Tipo de convalidación (externa o cambio de carrera)
- Institución y carrera de origen
- Motivo de la solicitud

**API:** `POST /api/convalidacion/solicitudes`

### Paso 2: Documentos
- Certificado de notas (obligatorio)
- Constancia institucional (obligatorio)
- Programa analítico (obligatorio)
- Documento de identidad (opcional)

**API:**
- `GET /api/convalidacion/solicitudes/{id}/documentos`
- `POST /api/convalidacion/solicitudes/{id}/documentos` (FormData)
- `DELETE /api/convalidacion/solicitudes/{id}/documentos/{docId}`

### Paso 3: Materias a Convalidar
- Tabla de materias agregadas
- Modal para agregar materia con:
  - Nombre de materia en origen
  - Institución
  - Nota obtenida
  - Créditos
  - Materia destino (select)
- Eliminar materias

**API:**
- `GET /api/carreras/{idCarrera}/materias`
- `GET /api/convalidacion/solicitudes/{id}/detalles`
- `POST /api/convalidacion/solicitudes/{id}/detalles`
- `DELETE /api/convalidacion/solicitudes/{id}/detalles/{detalleId}`

### Paso 4: Pago
- Resumen de costos:
  - Cantidad de materias
  - Arancel por materia
  - Gestión
  - Descuentos
  - Total a pagar
- Forma de pago (Transferencia, Efectivo, QR)
- Número de comprobante
- Fecha de pago
- Estado: "Pendiente verificación"

**API:**
- `GET /api/convalidacion/solicitudes/{id}/cuota`
- `POST /api/convalidacion/solicitudes/{id}/cuota`
- `POST /api/convalidacion/solicitudes/{id}/pago`

### Paso 5: Resolución Académica
- Tabla de materias con estado (Aprobada/En revisión/Observada)
- Observación de la comisión
- Número de resolución
- Docente revisor
- Alerta de historial actualizado
- Botón "Generar reporte"

**API:**
- `GET /api/convalidacion/solicitudes/{id}/resolucion`

## Temas

El módulo usa el sistema de temas del proyecto:

- `theme.colors.background` - Fondo principal
- `theme.colors.card` - Fondo de tarjetas
- `theme.colors.text` - Texto principal
- `theme.colors.textMuted` - Labels uppercase
- `theme.colors.primary` - Color institucional
- `theme.colors.info` - Azul (#3B82F6) - Botones y badges activos
- `theme.colors.success` - Verde (#10B981) - Aprobado
- `theme.colors.warning` - Amarillo (#F59E0B) - Pendiente
- `theme.colors.destructive` - Rojo - Observado/Errores

## Validaciones

### Paso 1
- CI, nombres, apellido paterno, fecha de nacimiento: **requeridos**
- Matrícula, carrera destino, gestión: **requeridos**
- Institución origen, carrera origen: **requeridos**

### Paso 2
- Los 3 documentos obligatorios deben estar cargados para avanzar

### Paso 3
- Sin validaciones (puede avanzar sin materias)

### Paso 4
- Fecha de pago: **requerida**

## Dependencias

- `expo-document-picker` - Selección de archivos
- `@react-native-community/datetimepicker` - Selector de fechas
- `react-native-toast-message` - Notificaciones
- `@expo/vector-icons` - Iconos (Ionicons)

## Notas Técnicas

1. **httpClient**: Todas las llamadas API usan `httpClient` del proyecto (nunca fetch directo)
2. **Autenticación**: Los endpoints usan métodos `*Auth` que inyectan el Bearer token automáticamente
3. **FormData**: Para subir archivos se usa `httpClient.postFormData()`
4. **Context**: El estado del wizard (paso actual, IDs, códigos) se maneja con React Context
5. **Hooks personalizados**: Cada paso tiene su hook con lógica y estado separado
6. **Tipos**: Todo tipado con TypeScript en `types/index.ts`
