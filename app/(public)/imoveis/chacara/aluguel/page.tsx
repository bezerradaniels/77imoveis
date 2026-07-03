import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "chacara", negotiation: "aluguel", path: "/imoveis/chacara/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
