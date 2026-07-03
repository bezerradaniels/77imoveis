import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "fazenda", negotiation: "temporada", path: "/imoveis/fazenda/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
