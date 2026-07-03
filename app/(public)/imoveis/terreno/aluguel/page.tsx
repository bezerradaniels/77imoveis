import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "terreno", negotiation: "aluguel", path: "/imoveis/terreno/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
