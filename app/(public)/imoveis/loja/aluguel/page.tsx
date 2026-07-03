import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "loja", negotiation: "aluguel", path: "/imoveis/loja/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
