import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "lote", negotiation: "aluguel", path: "/imoveis/lote/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
