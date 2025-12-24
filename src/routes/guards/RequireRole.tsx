import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../app/providers";
import { paths } from "../paths";

type Role = "imobiliaria" | "corretor" | "usuario";

export default function RequireRole({ allow }: { allow: Role[] }) {
  const { role, loading, user } = useContext(AuthContext);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!user) return <Navigate to={paths.login} replace />;

  if (!role || !allow.includes(role)) {
    return <Navigate to={paths.home} replace />;
  }

  return <Outlet />;
}
