import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "loja", negotiation: "lancamento", path: "/imoveis/loja/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
