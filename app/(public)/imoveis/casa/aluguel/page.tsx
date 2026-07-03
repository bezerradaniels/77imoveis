import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "casa", negotiation: "aluguel", path: "/imoveis/casa/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
