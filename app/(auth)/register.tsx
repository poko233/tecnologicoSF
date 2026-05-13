import { ProtectedRoute } from "@/components/ProtectedRoute";
import RegisterScreen from "../../screens/auth/RegisterScreen";

export default function Register() {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/">
      <RegisterScreen />
    </ProtectedRoute>
  );
}
