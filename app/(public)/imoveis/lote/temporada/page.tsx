import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "lote", negotiation: "temporada", path: "/imoveis/lote/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
