import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "cobertura", negotiation: "aluguel", path: "/imoveis/cobertura/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
