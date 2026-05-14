import { ProtectedRoute } from "@/components/ProtectedRoute";
import RegisterScreen from "../../screens/auth/RegisterScreen";

export default function Register() {
  return (
    <ProtectedRoute
      roles={[
        "Administrador",
        "Rector",
        "Director Academico",
        "Director Administrativo",
        "Fundador",
      ]}
      redirectTo="/"
    >
      <RegisterScreen />
    </ProtectedRoute>
  );
}
