import { Outlet, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../app/providers";
import { paths } from "../../routes/paths";

export default function DashboardLayout() {
  const { signOut, role } = useContext(AuthContext);

  return (
    <div className="min-h-full grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="border-r p-4">
        <div className="font-bold">77 Imóveis</div>
        <div className="text-sm text-muted-foreground mb-4">Dashboard ({role ?? "?"})</div>

        <nav className="space-y-2 text-sm">
          <Link className="block hover:underline" to={paths.home}>Ir para Home</Link>
          <Link className="block hover:underline" to={paths.listings}>Ver Imóveis</Link>
          <button className="mt-4 text-left underline" onClick={() => void signOut()}>
            Sair
          </button>
        </nav>
      </aside>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
