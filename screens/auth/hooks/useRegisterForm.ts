// screens/auth/hooks/useRegisterForm.ts
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { registerUser } from "../services/auth.service";
import type { RegisterRequest, ValidationErrors } from "../types/auth.types";

const MAX_40 = 40;
const MAX_10 = 10;
const MAX_12 = 12;

const validateField = (name: keyof RegisterRequest, value: string): string => {
  switch (name) {
    case "usuario":
      if (!value.trim()) return "Obligatorio";
      if (value.trim().length > MAX_40) return `Máx ${MAX_40} caracteres`;
      return "";
    case "password":
      if (!value) return "Obligatorio";
      if (value.length < 6) return "Mínimo 6 caracteres";
      return "";
    case "ci":
      if (!value.trim()) return "Obligatorio";
      if (value.trim().length > MAX_12) return `Máx ${MAX_12} caracteres`;
      return "";
    case "nombres":
      if (!value.trim()) return "Obligatorio";
      if (value.trim().length > MAX_40) return `Máx ${MAX_40} caracteres`;
      return "";
    case "apellidos":
      if (!value.trim()) return "Obligatorio";
      if (value.trim().length > MAX_40) return `Máx ${MAX_40} caracteres`;
      return "";
    case "genero":
      if (!value) return "Selecciona un género";
      if (value !== "MASCULINO" && value !== "FEMENINO")
        return "Valor inválido";
      return "";
    case "fecha_nac":
      if (!value) return "Obligatorio";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Formato YYYY-MM-DD";
      return "";
    case "email":
      // campo opcional: si tiene contenido, validar; vacío es válido
      if (value && value.length > 80) return "Máx 80 caracteres";
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Email inválido";
      return "";
    case "telefono":
    case "celular":
      if (value && value.length > MAX_10) return `Máx ${MAX_10} caracteres`;
      return "";
    default:
      return "";
  }
};

export function useRegisterForm() {
  const { login } = useAuth();
  const [form, setForm] = useState<RegisterRequest>({
    usuario: "",
    password: "",
    ci: "",
    nombres: "",
    apellidos: "",
    genero: "" as "MASCULINO" | "FEMENINO",
    fecha_nac: "",
    email: "",
    telefono: "",
    celular: "",
  });
  const [errors, setErrors] = useState<ValidationErrors<RegisterRequest>>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegisterRequest, boolean>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = useCallback(
    (field: keyof RegisterRequest) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
      if (serverError) setServerError(null);
    },
    [touched, serverError],
  );

  const handleBlur = useCallback(
    (field: keyof RegisterRequest) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, form[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [form],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors<RegisterRequest> = {};
    (Object.keys(form) as (keyof RegisterRequest)[]).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    // Marcar todos como tocados
    setTouched((prev) => {
      const allTouched: typeof touched = {};
      (Object.keys(form) as (keyof RegisterRequest)[]).forEach((key) => {
        allTouched[key] = true;
      });
      return { ...prev, ...allTouched };
    });
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const response = await registerUser(form);
      await login(response.token);
    } catch (err: any) {
      const message = err?.message || "Error inesperado";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  }, [form, validateForm, login]);

  const canSubmit = useMemo(() => {
    return (
      Object.values(errors).every((e) => !e) &&
      form.usuario.trim() &&
      form.password &&
      form.ci.trim() &&
      form.nombres.trim() &&
      form.apellidos.trim() &&
      form.genero &&
      form.fecha_nac
    );
  }, [errors, form]);

  return {
    form,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    serverError,
    canSubmit,
  };
}
