import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "kitnet", negotiation: "aluguel", path: "/imoveis/kitnet/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
