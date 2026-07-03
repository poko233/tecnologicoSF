
export interface HttpClientError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export function obtenerMensajeError(
  err: unknown,
  fallback: string,
): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as any).message === "string"
  ) {
    return (err as HttpClientError).message;
  }
  return fallback;
}