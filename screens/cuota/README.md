# Sistema de Gestión de Cuotas con Pagos Parciales

Sistema completo para gestionar cuotas estudiantiles con soporte de **pagos parciales (subcuotas)**.

## 📋 Características

- ✅ Búsqueda de estudiantes por CI, nombre o matrícula
- ✅ Visualización de cuotas por carrera
- ✅ **Pagos parciales**: Una cuota se puede pagar en varios abonos
- ✅ Estados dinámicos: `Debe`, `Parcial`, `Pagado`
- ✅ Historial completo de abonos por cuota
- ✅ Métodos de pago: Efectivo, Transferencia, Tarjeta, QR
- ✅ Estado de cuenta con totales
- ✅ Interfaz responsive y moderna

## 🚀 Uso

### **1. Acceder a la pantalla:**

```
/cuotas
```

### **2. Buscar estudiante:**

1. Ingresa el CI del estudiante
2. Click en "Buscar"
3. Selecciona una carrera de la lista

### **3. Pagar una cuota:**

1. Click en "Pagar" en la cuota deseada
2. Ingresa el monto (parcial o total)
3. Selecciona el método de pago
4. (Opcional) Ingresa comprobante y observación
5. Click en "Confirmar Pago"

**Ejemplos de pagos:**
- **Pago parcial**: Cuota de Bs. 654.55 → Pagar Bs. 100.00 → Estado: `Parcial`
- **Segundo abono**: Pagar otros Bs. 200.00 → Acumulado: Bs. 300.00
- **Pago completo**: Pagar Bs. 354.55 → Total: Bs. 654.55 → Estado: `Pagado`

### **4. Ver historial de abonos:**

1. Click en "Historial" en la cuota
2. Ver lista de todos los abonos realizados
3. Incluye: fecha, monto, método, cajero

## 📁 Estructura de Archivos

```
screens/cuota/
├── types/
│   └── cuota.types.ts              # TypeScript interfaces
├── services/
│   └── cuota.service.ts            # API calls
├── components/
│   ├── PagoModal.tsx               # Modal para pagar
│   └── HistorialAbonosModal.tsx    # Modal de historial
├── GestionCuotasCompleta.tsx       # Pantalla principal
└── README.md                       # Esta documentación
```

## 🔧 API Endpoints Utilizados

```typescript
// Buscar estudiantes
GET /api/cuota/search?search={ci}&per_page=15

// Obtener carreras del estudiante
GET /api/estudiantes/{id}/carreras

// Obtener estado de cuenta (cuotas + abonos)
GET /api/estudiantes/{id}/carreras/{carreraId}/estado-cuenta

// Registrar pago
POST /api/pagos
{
  "idUsuario": 161,
  "metodo": "EFECTIVO",
  "cuotas": [
    {"idCuota": 385, "monto_abonado": 100.00}
  ],
  "comprobante": "REC-001",
  "observacion": "Primer abono"
}

// Ver historial de abonos
GET /api/cuotas/{idCuota}/abonos
```

## 📊 Estados de Cuotas

| Estado | Descripción | Color |
|--------|-------------|-------|
| `Debe` | Sin ningún pago | Rojo |
| `Parcial` | Pagado parcialmente (0 < pagado < total) | Amarillo |
| `Pagado` | Pagado completamente | Verde |
| `Condonado` | Cuota condonada | Gris |

## 💡 Validaciones

- ✅ No se puede pagar más del saldo pendiente
- ✅ El monto debe ser mayor a 0
- ✅ No se puede pagar cuotas ya completadas
- ✅ El estado se actualiza automáticamente

## 🎨 Componentes

### **PagoModal**
Modal para registrar un pago parcial o total.

**Props:**
- `visible`: boolean - Mostrar/ocultar modal
- `cuota`: Cuota | null - Cuota a pagar
- `onClose`: () => void - Cerrar modal
- `onPagar`: (monto, metodo, comprobante?, observacion?) => Promise<void>

### **HistorialAbonosModal**
Modal para ver el historial de abonos de una cuota.

**Props:**
- `visible`: boolean - Mostrar/ocultar modal
- `cuotaId`: number | null - ID de la cuota
- `onClose`: () => void - Cerrar modal

## 🧪 Testing

Prueba con estos datos de ejemplo:

**Estudiante:**
- CI: `2342344234`
- Nombre: Aron ASD Padilla
- Carrera: ENFERMERÍA
- Total cuotas: 12

**Escenario de prueba:**
1. Buscar estudiante por CI
2. Seleccionar carrera ENFERMERÍA
3. Pagar Bs. 100 a la Cuota #1
4. Verificar estado cambia a "Parcial"
5. Ver historial de la cuota
6. Pagar Bs. 554.55 (saldo restante)
7. Verificar estado cambia a "Pagado"

## 🐛 Troubleshooting

**Problema: No aparecen las carreras**
- Verificar que el estudiante esté inscrito en al menos una carrera
- Revisar la consola para errores de API

**Problema: Error al pagar**
- Verificar que haya un arqueo abierto
- Revisar permisos del usuario
- Verificar que el monto no supere el saldo

**Problema: El estado no se actualiza**
- Verificar que la migración se haya ejecutado
- Verificar que el enum incluya el estado "Parcial"

## 📞 Soporte

Para reportar bugs o solicitar features, contacta al desarrollador.
