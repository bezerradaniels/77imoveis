import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ negotiation: "aluguel", path: "/imoveis/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
