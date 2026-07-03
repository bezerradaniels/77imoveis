import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "condominio", negotiation: "temporada", path: "/imoveis/condominio/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
