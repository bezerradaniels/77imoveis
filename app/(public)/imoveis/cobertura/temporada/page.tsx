import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "cobertura", negotiation: "temporada", path: "/imoveis/cobertura/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
