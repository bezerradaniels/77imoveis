import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "condominio", negotiation: "lancamento", path: "/imoveis/condominio/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
