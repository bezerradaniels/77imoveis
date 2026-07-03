import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "casa", negotiation: "temporada", path: "/imoveis/casa/temporada" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
