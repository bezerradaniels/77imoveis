import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "cobertura", negotiation: "lancamento", path: "/imoveis/cobertura/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
