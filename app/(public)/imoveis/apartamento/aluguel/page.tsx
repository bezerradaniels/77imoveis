import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "apartamento", negotiation: "aluguel", path: "/imoveis/apartamento/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
