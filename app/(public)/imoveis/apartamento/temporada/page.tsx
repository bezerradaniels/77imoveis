import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "apartamento", negotiation: "temporada", path: "/imoveis/apartamento/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
