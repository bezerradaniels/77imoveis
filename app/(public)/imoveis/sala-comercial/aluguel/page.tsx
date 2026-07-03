import { createImoveisRoute } from "../../_route";

const route = createImoveisRoute({ typeSlug: "sala-comercial", negotiation: "aluguel", path: "/imoveis/sala-comercial/aluguel" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
