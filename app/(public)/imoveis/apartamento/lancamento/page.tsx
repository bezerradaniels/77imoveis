import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "apartamento", negotiation: "lancamento", path: "/imoveis/apartamento/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
