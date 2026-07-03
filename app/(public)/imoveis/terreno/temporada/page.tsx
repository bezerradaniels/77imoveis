import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "terreno", negotiation: "temporada", path: "/imoveis/terreno/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
