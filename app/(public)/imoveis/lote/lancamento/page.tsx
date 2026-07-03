import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "lote", negotiation: "lancamento", path: "/imoveis/lote/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
