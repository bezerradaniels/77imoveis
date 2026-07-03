import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "fazenda", negotiation: "aluguel", path: "/imoveis/fazenda/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
