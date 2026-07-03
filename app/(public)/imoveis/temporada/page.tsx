import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ negotiation: "temporada", path: "/imoveis/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
