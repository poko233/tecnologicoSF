/**
 * Tokens visuales del módulo Empresa.
 *
 * Pensado para una pantalla de "Configuración / Identidad" administrativa:
 * tono serio, técnico, con acentos cálidos para diferenciar de la
 * paleta neutra del resto del panel.
 */

export const colores = {
  fondo: '#F7F5F1',
  superficie: '#FFFFFF',
  borde: '#E4DFD6',
  bordeFoco: '#1F4E3D',

  textoPrimario: '#1C1B19',
  textoSecundario: '#6F6A60',
  textoSobreAccento: '#FFFFFF',

  acento: '#1F4E3D',
  acentoSuave: '#E8F0EC',
  advertencia: '#B8512F',
  advertenciaSuave: '#F7E7E0',
  exito: '#2E6B4F',
  exitoSuave: '#E6F0EA',
} as const;

export const tipografia = {
  etiqueta: 12,
  cuerpo: 15,
  subtitulo: 17,
  titulo: 22,
} as const;

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radios = {
  campo: 10,
  tarjeta: 14,
  imagen: 10,
  icono: 14,
} as const;