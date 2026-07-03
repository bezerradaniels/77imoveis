import { createImoveisRoute } from "../_route";

const route = createImoveisRoute({ negotiation: "lancamento", path: "/imoveis/lancamento" });

export const revalidate = 300;
export const generateMetadata = route.generateMetadata;
export default route.Page;
