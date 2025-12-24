import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../app/providers";
import { paths } from "../paths";

export default function GuestOnly() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (user) return <Navigate to={paths.home} replace />;

  return <Outlet />;
}
