import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "galpao", negotiation: "aluguel", path: "/imoveis/galpao/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
