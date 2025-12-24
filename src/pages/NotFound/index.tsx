import { Link } from "react-router-dom";
import Container from "../../components/common/Container";
import Seo from "../../components/common/Seo";
import { paths } from "../../routes/paths";

export default function NotFound() {
  return (
    <>
      <Seo title="77 Imóveis | Página não encontrada" />
      <Container className="py-10 space-y-3">
        <h1 className="text-2xl font-bold">404 — Página não encontrada</h1>
        <p className="text-muted-foreground">
          Essa rota não existe (ainda). Verifique o endereço ou volte para a Home.
        </p>
        <Link className="underline" to={paths.home}>
          Voltar para Home
        </Link>
      </Container>
    </>
  );
}
