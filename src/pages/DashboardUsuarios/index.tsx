import Seo from "../../components/common/Seo";

export default function DashboardUsuarios({ title }: { title?: string }) {
  return (
    <>
      <Seo title={`77 Imóveis | ${title || "Dashboard Usuário"}`} />
      <h1 className="text-2xl font-bold mb-2">{title || "Dashboard do Usuário"}</h1>
      <p className="text-muted-foreground">
        Placeholder: favoritos, mensagens enviadas, histórico e configurações da conta.
      </p>
    </>
  );
}
