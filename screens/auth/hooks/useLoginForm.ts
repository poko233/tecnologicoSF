import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../contexts/AuthContext";
import { loginUser } from "../services/auth.service";
import type { LoginRequest, ValidationErrors } from "../types/auth.types";

const HOME_ROUTE = "/"; // cambia esto si tu home real es otra ruta

const validateField = (name: keyof LoginRequest, value: string): string => {
  switch (name) {
    case "usuario":
      if (!value.trim()) return "Campo obligatorio";
      if (value.trim().length > 40) return "Máximo 40 caracteres";
      return "";
    case "password":
      if (!value) return "Contraseña requerida";
      if (value.length < 6) return "Mínimo 6 caracteres";
      return "";
    default:
      return "";
  }
};

export function useLoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginRequest>({ usuario: "", password: "" });
  const [errors, setErrors] = useState<ValidationErrors<LoginRequest>>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginRequest, boolean>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = useCallback(
    (field: keyof LoginRequest) => (value: string) => {
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
    (field: keyof LoginRequest) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, form[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [form],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors<LoginRequest> = {};
    (Object.keys(form) as (keyof LoginRequest)[]).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({ usuario: true, password: true });
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await loginUser(form);
      await login(response.token);

      Toast.show({
        type: "success",
        text1: "Inicio de sesión exitoso",
        text2: "Bienvenido de nuevo.",
        visibilityTime: 2500,
      });

      router.replace(HOME_ROUTE);
    } catch (err: any) {
      const message = err?.message || "Error inesperado";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  }, [form, validateForm, login]);

  const canSubmit = useMemo(() => {
    return Boolean(
      Object.values(errors).every((e) => !e) &&
      form.usuario.trim() &&
      form.password,
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
