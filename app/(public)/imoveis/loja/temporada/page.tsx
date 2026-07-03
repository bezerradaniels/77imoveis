import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "loja", negotiation: "temporada", path: "/imoveis/loja/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
