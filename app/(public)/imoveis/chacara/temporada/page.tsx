import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "chacara", negotiation: "temporada", path: "/imoveis/chacara/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
