import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "condominio", negotiation: "aluguel", path: "/imoveis/condominio/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
